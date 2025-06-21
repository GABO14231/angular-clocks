import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {ModalComponent} from '../../components/Modal/Modal';
import {ProfileService} from '../../services/ProfileService';
import {AuthService, User} from '../../services/AuthService';
import {Subscription, lastValueFrom} from 'rxjs';

export interface ConfirmModalConfig {message: string; buttons: {label: string; action: () => void }[];}
@Component({selector: 'app-delete-profile-page', standalone: true,
    imports: [ModalComponent, FontAwesomeModule, FormsModule, CommonModule, RouterModule],
    templateUrl: './DeleteProfile.html', styleUrls: ['./DeleteProfile.css']})
export class DeleteProfilePage implements OnInit, OnDestroy
{
    user: User | null = null;
    userSub!: Subscription;
    password: string = "";
    message: string = "";
    showPassword: boolean = false;
    showConfirmModal: boolean = false;
    confirmModalConfig: ConfirmModalConfig = {message: "", buttons: []};

    constructor(private profileService: ProfileService, private authService: AuthService,
        private router: Router, library: FaIconLibrary) {library.addIcons(faEye, faEyeSlash);}

    ngOnInit(): void {this.userSub = this.authService.user$.subscribe(u => {this.user = u;});}
    ngOnDestroy(): void {this.userSub.unsubscribe();}

    validateInput(): string
    {
        if (this.password.length < 6) return "Password must be at least 6 characters.";
        return "";
    }

    async handleDelete(): Promise<void>
    {
        const validationError = this.validateInput();
        if (validationError)
        {
            this.message = validationError;
            return;
        }
        if (!this.user)
        {
            this.message = "No user logged in.";
            return;
        }
        try
        {
            const response = await lastValueFrom(this.profileService.deleteProfile(this.password, this.user.id));
            if (response.body.status === "success")
            {
                console.log(`Server response: ${response.body.message}`);
                this.authService.logout().subscribe({next: () => this.router.navigate(['/login']),
                    error: err => console.error("Logout after deletion failed", err)});
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
            this.message = "Profile deletion failed";
        }
    }

    confirmDeleteProfile(): void
    {
        this.confirmModalConfig =
        {
            message: "Are you REALLY sure you want to delete your profile?",
            buttons: [{label: "Yes", action: () => {this.handleDelete(); this.showConfirmModal = false;}},
                {label: "Cancel", action: () => this.showConfirmModal = false}]
        };
        this.showConfirmModal = true;
    }

    togglePasswordVisibility(): void {this.showPassword = !this.showPassword;}
    clearMessage(): void {this.message = '';}
    cancel(): void {this.router.navigate(['/profile']);}
}