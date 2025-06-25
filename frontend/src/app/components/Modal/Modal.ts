import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

export interface ModalButton
{
    label: string;
    action: () => void;
}

@Component({selector: 'app-modal', standalone: true, imports: [CommonModule],
    templateUrl: './Modal.html', styleUrl: './Modal.css'})

export class ModalComponent
{
    @Input() message: string | null = null;
    @Input() buttons: ModalButton[] = [];
}