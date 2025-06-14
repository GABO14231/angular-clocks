import express from 'express';
import cors from 'cors';
import fs from 'fs';
import {runQuery} from './DBComponent.js';
const config = JSON.parse(fs.readFileSync('./config.json'));

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
}

app.use(cors());
app.use(express.json());

app.post('/users/register', async (req, res) =>
{
    const {username, email, password, first_name, last_name} = req.body;
    const code = generateRecoveryCode();
    try
    {
        const existingUserResult = await runQuery(config.queries.getUser, [email, username]);
        if (existingUserResult.rowCount > 0)
        {
            console.log(`ERROR: User already exists.`);
            return res.status(400).json({status: "error", message: "An user with this email or username already exists."});
        }
        const result = await runQuery(config.queries.addUser, [email, username, password, first_name, last_name, code]);
        console.log(`Registered new user: ${username}`);
        res.status(200).json({status: "success", message: "User registered!", user: result.rows[0]});
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({status: "error", message: "Registration failed"});
    }
});

app.post('/users/login', async (req, res) =>
{
    const {identifier, password} = req.body;
    try
    {
        const query = identifier.includes("@") ? config.queries.getUserEmail : config.queries.getUsername;
        const result = await runQuery(query, [identifier]);
        if (result.rowCount === 0)
        {
            console.log(`ERROR: User could not be found.`);
            return res.status(400).json({status: "error", message: "User not found."});
        }
        const user = result.rows[0];
        if (password !== user.user_password)
        {
            console.log(`ERROR: Incorrect credentials.`);
            return res.status(400).json({status: "error", message: "Invalid credentials."});
        }
        console.log(`User logged in: ${identifier}`);
        res.status(200).json({status: "success", message: "Successful login!", user});
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({status: "error", message: "An error occurred during login."});
    }
});

app.put('/users/:id', async (req, res) =>
{
    const {id} = req.params;
    const {username, email, first_name, last_name, currentPassword, newPassword} = req.body;
    try
    {
        const userResult = await runQuery(config.queries.verifyPass, [id]);
        if (userResult.rowCount === 0)
        {
            console.log(`ERROR: User was not found.`);
            return res.status(404).json({status: 'error', message: 'User not found'});
        }
        let updateQuery = "";
        let values = [];
        if (currentPassword && newPassword)
        {
            if (currentPassword !== userResult.rows[0].user_password)
            {
                console.log(`ERROR: Current password is incorrect.`);
                return res.status(400).json({status: 'error', message: 'Current password is incorrect'});
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
        console.log(`User updated: ${username}`);
        res.status(200).json({status: 'success', message: 'User updated successfully', user: result.rows[0]});
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({status: 'error', message: 'User update failed'});
    }
});

app.put('/users/:id/updatecode', async (req, res) =>
{
    const {id} = req.params;
    try
    {
        const newCode = generateRecoveryCode();
        const result = await runQuery(config.queries.updateCode, [newCode, id]);
        console.log(`Code updated: ${newCode}`);
        res.status(200).json({status: 'success', message: 'Code updated successfully', user: result.rows[0]});
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
            return res.status(400).json({status: 'error', message: 'Invalid recovery code'});
        }
        else
        {
            const id = idQuery.rows[0].id_user;
            const passwordQuery = await runQuery(config.queries.verifyPass, [id]);
            if (newPassword === passwordQuery.rows[0].user_password)
            {
                console.log(`ERROR: This is your current password.`);
                return res.status(400).json({status: 'error', message: 'This is your current password'});                    
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
        res.status(500).json({status: 'error', message: 'Password recovery failed'});
    }
});

app.delete('/users/:id', async (req, res) =>
{
    const {id} = req.params;
    const {password} = req.body;
    try
    {
        const userResult = await runQuery(config.queries.verifyPass, [id]);
        if (userResult.rowCount === 0)
        {
            console.log(`ERROR: User could not be found.`);
            return res.status(404).json({status: 'error', message: 'User not found'});
        }
        if (password !== userResult.rows[0].user_password)
        {
            console.log(`ERROR: Password is incorrect.`);
            return res.status(400).json({status: 'error', message: 'Password is incorrect'});
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
        res.status(200).json({status: 'success', message: 'User deleted and IDs renumbered.'});
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({status: 'error', message: 'User deletion failed.'});
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));