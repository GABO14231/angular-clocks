import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
export interface MenuOption {label: string; action: () => void;}

@Component({selector: 'app-menu', standalone: true, imports: [CommonModule, FormsModule],
    templateUrl: './ClockMenu.html', styleUrl: './ClockMenu.css'})

export class ClockMenu
{
    @Input() options: MenuOption[] = [];
    @Output() optionSelected: EventEmitter<MenuOption> = new EventEmitter<MenuOption>();

    onOptionSelect(option: MenuOption): void
    {
        if (option.action) option.action();
        this.optionSelected.emit(option);
    }
}