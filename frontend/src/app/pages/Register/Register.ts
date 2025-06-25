import {Component} from '@angular/core';
import {Location} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {ModalComponent} from '../../components/Modal/Modal';
import {ProfileService} from '../../services/ProfileService';
import {lastValueFrom} from 'rxjs';

@Component({selector: 'app-register', standalone: true,
    imports: [ModalComponent, FontAwesomeModule, FormsModule, RouterModule], templateUrl: './Register.html',
    styleUrl: './Register.css'})

export class RegisterPage
{
    input = {username: '', email: '', password: '', first_name: '', last_name: ''};
    showPassword = false;
    message = '';
    navigateAfterClose = false;

    constructor(private profileService: ProfileService, private router: Router, library: FaIconLibrary,
        private location: Location) {library.addIcons(faEye, faEyeSlash);}

    validateInput(): string
    {
        const {username, email, password, first_name, last_name} = this.input;
        if (!username || !email || !password || !first_name || !last_name) return 'All fields are required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!email.includes('@')) return "Email must contain '@'.";
        if (!emailRegex.test(email)) return "Invalid email format (check domain part).";
        const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
        if (username.length < 3) return "Username must be at least 3 characters.";
        if (!usernameRegex.test(username)) return "Username can only contain letters, numbers, and underscores.";
        if (password.length < 6) return "Password must be at least 6 characters.";
        return '';
    }

    async handleSubmit(): Promise<void>
    {
        const validationError = this.validateInput();
        if (validationError)
        {
            this.message = validationError;
            return;
        }
        try
        {
            const response = await lastValueFrom(this.profileService.registerUser(this.input));
            if (response.body.status === "success")
            {
                console.log(`Server response: ${response.body.message}`);
                this.message = "User registered successfully!";
                this.navigateAfterClose = true;
            }
            else
            {
                console.log(`Server response: ${response.body.message}`);
                this.message = response.body.message;
            }
        }
        catch (err)
        {
            console.error(err);
            this.message = "Registration failed";
        }
    }

    togglePasswordVisibility(): void {this.showPassword = !this.showPassword;}
    previousPage(): void {this.location.back();}
    handleModalClose(): void
    {
        this.message = '';
        if (this.navigateAfterClose)
        {
            this.navigateAfterClose = false;
            this.router.navigate(['/login']);
        }
    }
}