import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageEditor } from './image-editor/image-editor';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ImageEditor],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    protected readonly title = signal('neuwagen');
}
