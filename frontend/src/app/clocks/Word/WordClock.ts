import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({selector: 'app-word-clock', standalone: true, imports: [CommonModule],
    templateUrl: 'WordClock.html', styleUrl: 'WordClock.css'})

export class WordClockComponent
{
    private readonly wordGrid: string[] = ["ITLISASTHEM", "CFIFTEENDCO", "TWENTYFIVEX", "THIRTYFTENS", "MINUTESTHEN",
        "HALOTHEPAST", "TOUFOURONES", "SEVENTWELVE", "NINEFIVETWO", "XZTENLENOVO", "EIGHTELEVEN", "SIXTHREEONE", "OCLOCKXAMPM"];

    public flattenedGrid: string[] = [];
    public activeLetters: boolean[] = [];

    private readonly wordMap: {[key: string]: {r: number, c: number}[]} =
    {
        "IT": [{r: 0, c: 0}, {r: 0, c: 1}],
        "IS": [{r: 0, c: 3}, {r: 0, c: 4}],
        "A": [{r: 0, c: 5}],
        "AM": [{r: 12, c: 7}, {r: 12, c: 8}],
        "PM": [{r: 12, c: 9}, {r: 12, c: 10}],
        "FIFTEEN": [{r: 1, c: 1}, {r: 1, c: 2}, {r: 1, c: 3}, {r: 1, c: 4}, {r: 1, c: 5}, {r: 1, c: 6}, {r: 1, c: 7}],
        "TWENTY": [{r: 2, c: 0}, {r: 2, c: 1}, {r: 2, c: 2}, {r: 2, c: 3}, {r: 2, c: 4}, {r: 2, c: 5}],
        "FIVE_MINUTES": [{r: 2, c: 6}, {r: 2, c: 7}, {r: 2, c: 8}, {r: 2, c: 9}],
        "THIRTY": [{r: 3, c: 0}, {r: 3, c: 1}, {r: 3, c: 2}, {r: 3, c: 3}, {r: 3, c: 4}, {r: 3, c: 5}],
        "TEN_MINUTES": [{r: 3, c: 7}, {r: 3, c: 8}, {r: 3, c: 9}],
        "MINUTES": [{r: 4, c: 0}, {r: 4, c: 1}, {r: 4, c: 2}, {r: 4, c: 3}, {r: 4, c: 4}, {r: 4, c: 5}, {r: 4, c: 6}],
        "PAST": [{r: 5, c: 7}, {r: 5, c: 8}, {r: 5, c: 9}, {r: 5, c: 10}],
        "TO": [{r: 6, c: 0}, {r: 6, c: 1}],
        "FOUR": [{r: 6, c: 3}, {r: 6, c: 4}, {r: 6, c: 5}, {r: 6, c: 6}],
        "ONE": [{r: 10, c: 8}, {r: 10, c: 9}, {r: 10, c: 10}],
        "SEVEN": [{r: 7, c: 0}, {r: 7, c: 1}, {r: 7, c: 2}, {r: 7, c: 3}, {r: 7, c: 4}],
        "TWELVE": [{r: 7, c: 5}, {r: 7, c: 6}, {r: 7, c: 7}, {r: 7, c: 8}, {r: 7, c: 9}, {r: 7, c: 10}],
        "NINE": [{r: 8, c: 0}, {r: 8, c: 1}, {r: 8, c: 2}, {r: 8, c: 3}],
        "FIVE_HOUR": [{r: 8, c: 4}, {r: 8, c: 5}, {r: 8, c: 6}, {r: 8, c: 7}],
        "TWO": [{r: 8, c: 8}, {r: 8, c: 9}, {r: 8, c: 10}],
        "TEN_HOUR": [{r: 9, c: 2}, {r: 9, c: 3}, {r: 9, c: 4}],
        "EIGHT": [{r: 10, c: 0}, {r: 10, c: 1}, {r: 10, c: 2}, {r: 10, c: 3}, {r: 10, c: 4}],
        "ELEVEN": [{r: 10, c: 5}, {r: 10, c: 6}, {r: 10, c: 7}, {r: 10, c: 8}, {r: 10, c: 9}, {r: 10, c: 10}],
        "SIX": [{r: 11, c: 0}, {r: 11, c: 1}, {r: 11, c: 2}],
        "THREE": [{r: 11, c: 3}, {r: 11, c: 4}, {r: 11, c: 5}, {r: 11, c: 6}, {r: 11, c: 7}],
        "OCLOCK": [{r: 12, c: 0}, {r: 12, c: 1}, {r: 12, c: 2}, {r: 12, c: 3}, {r: 12, c: 4}, {r: 12, c: 5}]
    };

    private readonly numberWords: string[] = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN",
        "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
        "SEVENTEEN", "EIGHTEEN", "NINETEEN", "TWENTY", "TWENTY-ONE", "TWENTY-TWO",
        "TWENTY-THREE", "TWENTY-FOUR", "TWENTY-FIVE", "TWENTY-SIX", "TWENTY-SEVEN",
        "TWENTY-EIGHT", "TWENTY-NINE", "THIRTY", "THIRTY-ONE", "THIRTY-TWO",
        "THIRTY-THREE", "THIRTY-FOUR", "THIRTY-FIVE", "THIRTY-SIX", "THIRTY-SEVEN",
        "THIRTY-EIGHT", "THIRTY-NINE", "FORTY", "FORTY-ONE", "FORTY-TWO",
        "FORTY-THREE", "FORTY-FOUR", "FORTY-FIVE", "FORTY-SIX", "FORTY-SEVEN",
        "FORTY-EIGHT", "FORTY-NINE", "FIFTY", "FIFTY-ONE", "FIFTY-TWO",
        "FIFTY-THREE", "FIFTY-FOUR", "FIFTY-FIVE", "FIFTY-SIX", "FIFTY-SEVEN", "FIFTY-EIGHT", "FIFTY-NINE"];

    private _hour: string = '00';
    private _minute: string = '00';
    private _second: string = '00';
    private _period: string = '';

    public secondsSpelledOut: string = '';

    constructor() {this.flattenedGrid = this.wordGrid.join('').split('');}

    @Input() set hour(value: string) {if (this._hour !== value) {this._hour = value; this.updateClock();}}
    @Input() set minute(value: string) {if (this._minute !== value) {this._minute = value; this.updateClock();}}
    @Input() set second(value: string) {if (this._second !== value) {this._second = value; this.updateClock();}}
    @Input() set period(value: string) {if (this._period !== value) {this._period = value; this.updateClock();}}

    private getFlatIndex(r: number, c: number): number {return r * 11 + c;}
    private activateWords(words: string[]): void
    {
        words.forEach(word =>
        {
            if (this.wordMap[word])
            {
                this.wordMap[word].forEach(coords =>
                {
                    const index = this.getFlatIndex(coords.r, coords.c);
                    if (index >= 0 && index < this.activeLetters.length) this.activeLetters[index] = true;
                });
            }
            else console.warn(`Word "${word}" not found in wordMap.`);
        });
    }

    private updateClock(): void
    {
        this.activeLetters = new Array(this.flattenedGrid.length).fill(false);

        let currentHours = parseInt(this._hour, 10);
        const currentMinutes = parseInt(this._minute, 10);
        const currentSeconds = parseInt(this._second, 10);

        if (this._period === 'PM' && currentHours < 12) currentHours += 12;
        else if (this._period === 'AM' && currentHours === 12) currentHours = 0;

        const wordsToActivate: string[] = [];
        wordsToActivate.push("IT", "IS");

        let displayHours = currentHours;

        if (currentMinutes >= 0 && currentMinutes < 5) wordsToActivate.push("OCLOCK");
        else if (currentMinutes >= 5 && currentMinutes < 10) wordsToActivate.push("FIVE_MINUTES", "MINUTES", "PAST");
        else if (currentMinutes >= 10 && currentMinutes < 15) wordsToActivate.push("TEN_MINUTES", "MINUTES", "PAST");
        else if (currentMinutes >= 15 && currentMinutes < 20) wordsToActivate.push("FIFTEEN", "MINUTES", "PAST");
        else if (currentMinutes >= 20 && currentMinutes < 25) wordsToActivate.push("TWENTY", "MINUTES", "PAST");
        else if (currentMinutes >= 25 && currentMinutes < 30) wordsToActivate.push("TWENTY", "FIVE_MINUTES", "MINUTES", "PAST");
        else if (currentMinutes >= 30 && currentMinutes < 35) wordsToActivate.push("THIRTY", "MINUTES", "PAST");
        else if (currentMinutes >= 35 && currentMinutes < 40)
        {
            wordsToActivate.push("TWENTY", "FIVE_MINUTES", "MINUTES", "TO");
            displayHours = (currentHours + 1) % 24
        }
        else if (currentMinutes >= 40 && currentMinutes < 45)
        {
            wordsToActivate.push("TWENTY", "MINUTES", "TO");
            displayHours = (currentHours + 1) % 24;
        }
        else if (currentMinutes >= 45 && currentMinutes < 50)
        {
            wordsToActivate.push("FIFTEEN", "MINUTES", "TO");
            displayHours = (currentHours + 1) % 24;
        }
        else if (currentMinutes >= 50 && currentMinutes < 55)
        {
            wordsToActivate.push("TEN_MINUTES", "MINUTES", "TO");
            displayHours = (currentHours + 1) % 24;
        }
        else if (currentMinutes >= 55 && currentMinutes < 60)
        {
            wordsToActivate.push("FIVE_MINUTES", "MINUTES", "TO");
            displayHours = (currentHours + 1) % 24;
        }

        displayHours = displayHours % 12;
        if (displayHours === 0) displayHours = 12;

        switch (displayHours)
        {
            case 1: wordsToActivate.push("ONE"); break;
            case 2: wordsToActivate.push("TWO"); break;
            case 3: wordsToActivate.push("THREE"); break;
            case 4: wordsToActivate.push("FOUR"); break;
            case 5: wordsToActivate.push("FIVE_HOUR"); break;
            case 6: wordsToActivate.push("SIX"); break;
            case 7: wordsToActivate.push("SEVEN"); break;
            case 8: wordsToActivate.push("EIGHT"); break;
            case 9: wordsToActivate.push("NINE"); break;
            case 10: wordsToActivate.push("TEN_HOUR"); break;
            case 11: wordsToActivate.push("ELEVEN"); break;
            case 12: wordsToActivate.push("TWELVE"); break;
        }

        if (currentHours >= 12) wordsToActivate.push("PM");
        else wordsToActivate.push("AM");

        this.activateWords(wordsToActivate);
        this.secondsSpelledOut = this.numberWords[currentSeconds];
    }
}