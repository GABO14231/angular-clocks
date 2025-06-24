import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {CommonModule, Location} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {NavbarComponent} from '../../components/Navbar/Navbar';
import {ModalComponent} from '../../components/Modal/Modal';
import {ProfileService} from '../../services/ProfileService';
import {AuthService, User} from '../../services/AuthService';
import {UrlService} from '../../services/UrlService';
import {Subscription, lastValueFrom} from 'rxjs';

export interface ConfirmButton {label: string; action: () => void;}
export interface ConfirmModalConfig {message: string; buttons: ConfirmButton[];}

@Component({selector: 'app-profile', standalone: true,
    imports: [FormsModule, FontAwesomeModule, ModalComponent, NavbarComponent, CommonModule, RouterModule],
    templateUrl: './Profile.html', styleUrls: ['./Profile.css']})

export class ProfilePage implements OnInit, OnDestroy
{
    user: User | null = null;
    form = {username: "", email: "", first_name: "", last_name: "", code: "", currentPassword: "", newPassword: "",
        confirmPassword: ""};
    message: string = "";
    passwordVisibility: {[key: string]: boolean} = {currentPassword: false, newPassword: false, confirmPassword: false,
        backupCode: false};
    showConfirmModal: boolean = false;
    confirmModalConfig: ConfirmModalConfig = {message: "", buttons: []};
    navbarOptions = [{label: "Go Back", method: () => this.previousPage()},
        {label: "Logout", path: "/", method: () => this.handleLogout()}];
    userSub!: Subscription;
    previousUrl: string | undefined;

    constructor(private profileService: ProfileService, private authService: AuthService,
        private router: Router, library: FaIconLibrary, private location: Location, private urlService: UrlService)
        {library.addIcons(faEye, faEyeSlash);}

    ngOnInit(): void
    {
        this.userSub = this.authService.user$.subscribe(u =>
        {
            this.user = u;
            if (this.user)
            {
                this.form =
                {
                    username: this.user.username,
                    email: this.user.email,
                    first_name: this.user.first_name,
                    last_name: this.user.last_name,
                    code: this.user.code,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                };
            }
        });
        this.previousUrl = this.urlService.getPreviousUrl();
    }

    ngOnDestroy(): void {if (this.userSub) this.userSub.unsubscribe();}

    previousPage(): void
    {
        if (this.previousUrl === "/delprofile") this.router.navigate(['/dashboard']);
        else this.location.back();
    }

    validateInput(): string
    {
        const {username, email, currentPassword, newPassword, confirmPassword} = this.form;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!email.includes("@")) return "Email must contain '@'.";
        if (!emailRegex.test(email)) return "Invalid email format (check domain part).";

        const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
        if (username.length < 3) return "Username must be at least 3 characters.";
        if (!usernameRegex.test(username)) return "Username can only contain letters, numbers, and underscores.";

        if (currentPassword !== "" || newPassword !== "" || confirmPassword !== "")
        {
            if (currentPassword === "" && (newPassword !== "" || confirmPassword !== ""))
                return "Please insert your current password.";
            if ((newPassword !== "" && confirmPassword === "") || (confirmPassword !== "" && newPassword === ""))
                return "Please enter your new password twice.";
            if (currentPassword.length < 6 || newPassword.length < 6 || confirmPassword.length < 6)
                return "Password must be at least 6 characters.";
            if (newPassword !== confirmPassword) return "The passwords do not match.";
            if (newPassword === confirmPassword && confirmPassword === currentPassword)
                return "You are using your current password. Please use a new one.";
        }
        return "";
    }

    async handleUpdate(): Promise<void>
    {
        const validationError = this.validateInput();
        if (validationError) {this.message = validationError; return;}
        try
        {
            const response = await lastValueFrom(this.profileService.loadProfile(this.form, this.user));
            if (response.body.status === "success" && response.body.user)
            {
                this.authService.updateUser(response.body.user);
                console.log(`Server response: ${response.body.message}`);
                this.message = "Profile updated successfully!";
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
            this.message = "Profile update failed";
        }
    }

    async handleCode(): Promise<void>
    {
        try
        {
            const response = await lastValueFrom(this.profileService.updateCode(this.user?.id));
            if (response.body.status === "success" && response.body.user)
            {
                this.authService.updateUser(response.body.user);
                console.log(`Server response: ${response.body.message}`);
                this.message = "Code updated successfully!";
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
            this.message = "Profile update failed";
        }
    }

    confirmUpdate(): void
    {
        this.confirmModalConfig =
        {
            message: "Are you sure you want to update your profile?",
            buttons: [{label: "Yes, change it", action: this.doUpdateProfile.bind(this)},
                {label: "Cancel", action: this.doCancelModal.bind(this)}]
        };
        this.showConfirmModal = true;
    }

    confirmChangeCode(): void
    {
        this.confirmModalConfig =
        {
            message: "Are you sure you want to change your recovery code?",
            buttons: [{label: "Yes, change it", action: this.doChangeCode.bind(this)},
                {label: "Cancel", action: this.doCancelModal.bind(this)}]
        };
        this.showConfirmModal = true;
    }

    confirmDeleteProfile(): void
    {
        this.confirmModalConfig =
        {
            message: "Are you sure you want to delete your profile?",
            buttons: [{label: "Yes, delete", action: this.handleDeleteNavigation.bind(this)},
                {label: "Cancel", action: this.doCancelModal.bind(this)}]
        };
        this.showConfirmModal = true;
    }

    doUpdateProfile(): void
    {
        this.handleUpdate();
        this.showConfirmModal = false;
    }

    doChangeCode(): void
    {
        this.handleCode();
        this.showConfirmModal = false;
    }

    handleDeleteNavigation(): void
    {
        this.router.navigate(['/delprofile']);
        this.showConfirmModal = false;
    }

    doCancelModal(): void {this.showConfirmModal = false;}
    togglePasswordVisibility(field: string): void {this.passwordVisibility[field] = !this.passwordVisibility[field];}

    handleLogout(): void
    {
        this.authService.logout().subscribe({next: response => console.log("Logged out:", response.message),
            error: err => console.error(err)});
    }

    clearMessage(): void {this.message = "";}
}