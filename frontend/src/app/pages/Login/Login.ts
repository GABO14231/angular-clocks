import {Component} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ModalComponent} from '../../components/Modal/Modal';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {AuthService} from '../../services/AuthService';

@Component({selector: 'app-login', standalone: true,
    imports: [ModalComponent, FontAwesomeModule, FormsModule, RouterModule], templateUrl: './Login.html',
    styleUrls: ['./Login.css']})

export class LoginPage
{
    input = {identifier: '', password: ''};
    message = '';
    showPassword = false;

    constructor(library: FaIconLibrary, private authService: AuthService, private router: Router) {
        library.addIcons(faEye, faEyeSlash);}

    validateInput(): string
    {
        const {identifier, password} = this.input;
        if (!identifier || !password) return 'Both fields are required.';
        const isEmail = identifier.includes('.') || identifier.includes('@');
        if (isEmail)
        {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
            if (!identifier.includes('@')) return "Email must contain '@'.";
            if (!emailRegex.test(identifier)) return 'Invalid email format (check domain part).';
        }
        else
        {
            const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
            if (identifier.length < 3) return 'Username must be at least 3 characters.';
            if (!usernameRegex.test(identifier)) return 'Username can only contain letters, numbers, and underscores.';
        }
        if (password.length < 6) return 'Password must be at least 6 characters.';
        return '';
    }

    handleSubmit(): void
    {
        const error = this.validateInput();
        if (error)
        {
            this.message = error;
            return;
        }
        this.authService.login(this.input.identifier, this.input.password).subscribe(
        {
            next: response =>
            {
                if (response.status === "success")
                {
                    console.log(`Server response: ${response.message}`);
                    this.router.navigate(['/']);
                }
                else
                {
                    console.log(`Server response: ${response.message}`);
                    this.message = response.message;
                }
            },
            error: err =>
            {
                console.error(err);
                this.message = 'An error occurred during login.';
            }
        });
    }

    togglePasswordVisibility(): void {this.showPassword = !this.showPassword;}
    clearMessage(): void {this.message = '';}
}