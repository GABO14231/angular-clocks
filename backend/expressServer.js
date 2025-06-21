import express from 'express';
import https from 'https';
import cors from 'cors';
import fs from 'fs';
import session from 'express-session';
import {runQuery} from './DBComponent.js';
const config = JSON.parse(fs.readFileSync('./config.json'));
const cert = fs.readFileSync('../https_certs/angular_clocks.pem', 'utf-8');
const key = fs.readFileSync('../https_certs/angular_clocks-key.pem', 'utf-8');
const credentials = {key: key, cert: cert};

const app = express();
const port = 3000;

const generateRecoveryCode = () =>
{
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 6; i++)
    {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
};

app.use(cors({origin: 'https://localhost:4200', credentials: true}));
app.use(express.json());

app.use(session({secret: 'your-secret-key', resave: false, saveUninitialized: false,
    cookie: {httpOnly: true, secure: true, maxAge: 1000 * 60 * 60, sameSite: false}}));

app.post('/register', async (req, res) =>
{
    const {username, email, password, first_name, last_name} = req.body;
    const code = generateRecoveryCode();
    try
    {
        const existingUserResult = await runQuery(config.queries.getUser, [email, username]);
        if (existingUserResult.rowCount > 0)
        {
            console.log(`ERROR: User already exists.`);
            return res.status(200).json({status: "error", message: "A user with this email or username already exists."});
        }
        await runQuery(config.queries.addUser, [email, username, password, first_name, last_name, code]);
        console.log(`Registered new user: ${username}`);
        res.status(200).json({status: "success", message: "User registered!"});
    }
    catch (error)
    {
        console.error(error);
        res.status(400).json({status: "error", message: "Registration failed"});
    }
});

app.post('/login', async (req, res) =>
{
    const {identifier, password} = req.body;
    try
    {
        const query = identifier.includes("@") ? config.queries.getUserEmail : config.queries.getUsername;
        const result = await runQuery(query, [identifier]);
        if (result.rowCount === 0)
        {
            console.log(`ERROR: User could not be found.`);
            return res.status(200).json({status: "error", message: "User not found."});
        }
        const user = result.rows[0];
        if (password !== user.user_password)
        {
            console.log(`ERROR: Incorrect credentials.`);
            return res.status(200).json({status: "error", message: "Invalid credentials."});
        }
        req.session.user = {id: user.id_user, username: user.username, email: user.email,
            first_name: user.first_name, last_name: user.last_name, code: user.code};
        console.log(`User logged in: ${identifier}`);
        res.status(200).json({status: "success", message: "Successful login!"});
    }
    catch (error)
    {
        console.error(error);
        res.status(400).json({status: "error", message: "An error occurred during login."});
    }
});

app.get('/session', (req, res) =>
{
    if (req.session && req.session.user) res.status(200).json({status: "success", user: req.session.user});
    else res.status(200).json({status: "error"});
});

app.post('/logout', (req, res) =>
{
    try
    {
        req.session.destroy();
        res.clearCookie('connect.sid');
        console.log('User logged out');
        res.status(200).json({status: "success", message: "Logged out"});
    }
    catch (error)
    {
        console.error(error);
        res.status(400).json({status: "error", message: "Logout failed"});
    }
});

app.put('/:id', async (req, res) =>
{
    const {id} = req.params;
    const {username, email, first_name, last_name, currentPassword, newPassword} = req.body;
    try
    {
        const userResult = await runQuery(config.queries.verifyPass, [id]);
        if (userResult.rowCount === 0)
        {
            console.log(`ERROR: User was not found.`);
            return res.status(200).json({status: 'error', message: 'User not found'});
        }
        let updateQuery = "";
        let values = [];
        if (currentPassword && newPassword)
        {
            if (currentPassword !== userResult.rows[0].user_password)
            {
                console.log(`ERROR: Current password is incorrect.`);
                return res.status(200).json({status: 'error', message: 'Current password is incorrect'});
            }
            updateQuery = config.queries.updateUser;
            values = [username, email, first_name, last_name, newPassword, id];
        }
        else
        {
            updateQuery = config.queries.updateUser2;
            values = [username, email, first_name, last_name, id];
        }
        const result = await runQuery(updateQuery, values);
        const user = result.rows[0];
        req.session.user = {id: user.id_user, username: user.username, email: user.email,
            first_name: user.first_name, last_name: user.last_name, code: user.code};
        console.log(`User updated: ${username}`);
        res.status(200).json({status: 'success', message: 'User updated successfully', user: req.session.user});
    }
    catch (error)
    {
        console.error(error);
        res.status(400).json({status: 'error', message: 'User update failed'});
    }
});

app.put('/:id/updatecode', async (req, res) =>
{
    const {id} = req.params;
    try
    {
        const newCode = generateRecoveryCode();
        const result = await runQuery(config.queries.updateCode, [newCode, id]);
        const user = result.rows[0];
        req.session.user.code = user.code;
        console.log(`Code updated: ${newCode}`);
        res.status(200).json({status: 'success', message: 'Code updated successfully', user: req.session.user});
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({status: 'error', message: 'Code update failed'});
    }
});

app.put('/recoverpass', async (req, res) =>
{
    const {code, newPassword} = req.body;
    try
    {
        const idQuery = await runQuery(config.queries.getCode, [code]);
        if (idQuery.rowCount === 0)
        {
            console.log(`ERROR: The recovery code is invalid.`);
            return res.status(200).json({status: 'error', message: 'Invalid recovery code'});
        }
        else
        {
            const id = idQuery.rows[0].id_user;
            const passwordQuery = await runQuery(config.queries.verifyPass, [id]);
            if (newPassword === passwordQuery.rows[0].user_password)
            {
                console.log(`ERROR: This is your current password.`);
                return res.status(200).json({status: 'error', message: 'This is your current password'});
            }
            else
            {
                const newCode = generateRecoveryCode();
                const values = [newCode, newPassword, id];
                await runQuery(config.queries.recoverPass, values);
                console.log('Password and recovery code updated');
                res.status(200).json({status: 'success', message: 'Password recovered successfully'});
            }
        }
    }
    catch (error)
    {
        console.error(error);
        res.status(400).json({status: 'error', message: 'Password recovery failed'});
    }
});

app.delete('/:id', async (req, res) =>
{
    const {id} = req.params;
    const {password} = req.body;
    try
    {
        const userResult = await runQuery(config.queries.verifyPass, [id]);
        if (userResult.rowCount === 0)
        {
            console.log(`ERROR: User could not be found.`);
            return res.status(200).json({status: 'error', message: 'User not found'});
        }
        if (password !== userResult.rows[0].user_password)
        {
            console.log(`ERROR: Password is incorrect.`);
            return res.status(200).json({status: 'error', message: 'Password is incorrect'});
        }
        await runQuery(config.queries.deleteUser, [id]);
        const checkUsers = await runQuery(config.queries.getUsers);
        if (checkUsers.rowCount === 0) await runQuery(config.queries.resetUserId);
        else
        {
            await runQuery(config.queries.resetUserId2);
            await runQuery(config.queries.resetUserId3);
        }
        console.log(`User deleted and IDs corrected.`);
        res.clearCookie('connect.sid');
        req.session.destroy();
        res.status(200).json({status: 'success', message: 'User deleted and IDs renumbered.'});
    }
    catch (error)
    {
        console.error(error);
        res.status(400).json({status: 'error', message: 'User deletion failed.'});
    }
});

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => console.log(`Server running on port ${port}`));