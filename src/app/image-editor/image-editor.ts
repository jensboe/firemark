import { Component, ViewChild, ElementRef, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import * as fabric from 'fabric';
@Component({
    selector: 'app-image-editor',
    imports: [CommonModule,
        MatIconModule,
        MatButton,
        MatExpansionModule,
        MatStepperModule,
        MatRadioModule,
        FormsModule
    ],
    templateUrl: './image-editor.html',
    styleUrl: './image-editor.css',
})
export class ImageEditor implements AfterViewInit {
    @ViewChild('canvas', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
    fileName = '';
    canvas!: fabric.Canvas;
    image!: fabric.FabricImage;
    watermark_image!: fabric.FabricImage;
    watermark_pos = 'bottom_left'

    watermark_positions: [string, string][] = [
        ['', 'bottom left'],
        ['', 'bottom right'],
        ['', 'top left'],
        ['', 'top right'],
    ];

    selected_ratio = '1:1';
    ratios: [string, string][] = [
        ['crop_original', 'org'],
        ['crop_free', 'free'],
        ['crop_square', '1:1'],
        ['crop_16_9', '16:9'],
        ['crop_3_2', '3:2'],
        ['crop_5_4', '5:4'],
        ['crop_7_5', '7:5'],
        ['crop_portrait', '9:16'],
        ['crop_portrait', '2:3'],
        ['crop_portrait', '4:5'],
        ['crop_portrait', '5:7'],
    ];
    ngAfterViewInit() {
        this.canvas = new fabric.Canvas(this.canvasElement.nativeElement, {
            width: 800,
            height: 600,
        });
    }

    private getMaxCanvasSize() {
        return {
            width: window.innerWidth * 1,
            height: window.innerHeight * 0.75,
        };
    }
    private resizeCanvas(width: number, height: number) {
        this.canvas.setDimensions({ width, height }, { cssOnly: false });
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    }


    private async loadWatermark() {
        try {
            this.watermark_image = await fabric.FabricImage.fromURL('/assets/watermark.png');
            this.watermark_image.set({
                originX: 'center',
                originY: 'center',
                left: this.canvas.getWidth() * 0.9,
                top: this.canvas.getHeight() * 0.9,
                selectable: false,
                evented: false,
            });
            this.canvas.add(this.watermark_image);
            this.canvas.renderAll();
        } catch (error) {
            console.error('Cant load watermark', error);
        }
    }

    onFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.fileName = file.name;
            if (this.image) {
                this.canvas.remove(this.image);
            }
            if (this.watermark_image) {
                this.canvas.remove(this.watermark_image);
            }
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imgUrl = e.target?.result as string;
                this.image = await fabric.FabricImage.fromURL(imgUrl);

                // Canvas an Bildgröße anpassen (mit Maximalwerten, damit es auf Bildschirm passt)
                const imgWidth = this.image.width ?? 800;
                const imgHeight = this.image.height ?? 600;

                const { width: maxWidth, height: maxHeight } = this.getMaxCanvasSize();
                const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);

                this.resizeCanvas(imgWidth * scale, imgHeight * scale);

                this.image.set({
                    originX: 'center',
                    originY: 'center',
                    scaleX: scale,
                    scaleY: scale,
                    left: this.canvas.getWidth() / 2,
                    top: this.canvas.getHeight() / 2,
                    selectable: false,
                    evented: false,
                });
                this.canvas.add(this.image);
                this.canvas.renderAll();

                await this.loadWatermark();
            };
            reader.readAsDataURL(file);
        }
    }
}
