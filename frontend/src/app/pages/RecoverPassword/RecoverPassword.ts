import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {ModalComponent} from '../../components/Modal/Modal';
import {ProfileService} from '../../services/ProfileService';
import {lastValueFrom} from 'rxjs';

@Component({selector: 'app-recover-password', standalone: true,
    imports: [ModalComponent, FontAwesomeModule, FormsModule], templateUrl: './RecoverPassword.html',
    styleUrls: ['./RecoverPassword.css']})

export class RecoverPasswordComponent
{
    code: string = "";
    newPassword: string = "";
    confirmPassword: string = "";
    showNewPassword: boolean = false;
    showConfirmPassword: boolean = false;
    message: string = "";
    navigateAfterClose: boolean = false;

    constructor(private profileService: ProfileService, private router: Router, library: FaIconLibrary) {
        library.addIcons(faEye, faEyeSlash);}

    toggleNewPasswordVisibility(): void {this.showNewPassword = !this.showNewPassword;}
    toggleConfirmPasswordVisibility(): void {this.showConfirmPassword = !this.showConfirmPassword;}

    validateInput(): string
    {
        if ((this.newPassword !== "" && this.confirmPassword === "") ||
            (this.confirmPassword !== "" && this.newPassword === ""))
            return "Please enter your new password twice.";
        if (this.newPassword.length < 6 || this.confirmPassword.length < 6)
            return "Password must be at least 6 characters.";
        if (this.newPassword !== this.confirmPassword)
            return "The passwords do not match.";
        return "";
    }

    async handleRecovery(event: Event): Promise<void>
    {
        event.preventDefault();
        const validationError = this.validateInput();
        if (validationError)
        {
            this.message = validationError;
            return;
        }
        try
        {
            const response = await lastValueFrom(this.profileService.recoverPassword(this.code, this.newPassword));
            if (response.ok)
            {
                console.log(`Server response: ${response.body.message}`);
                this.message = "Password recovered successfully!";
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
            this.message = "Password recovery failed.";
        }
    }

    cancel(): void {this.router.navigate(['/login']);}
    handleModalClose(): void
    {
        this.message = "";
        if (this.navigateAfterClose)
        {
            this.navigateAfterClose = false;
            this.router.navigate(['/login']);
        }
    }
}