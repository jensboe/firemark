import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as fabric from 'fabric';

@Component({
    selector: 'app-image-editor',
    imports: [CommonModule],
    templateUrl: './image-editor.html',
    styleUrl: './image-editor.css',
})
export class ImageEditor implements AfterViewInit {
    @ViewChild('canvas', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
    canvas!: fabric.Canvas;
    image!: fabric.FabricImage;
    watermark!: fabric.FabricImage;

    ngAfterViewInit() {
        this.canvas = new fabric.Canvas(this.canvasElement.nativeElement, {
            width: 800,
            height: 600,
        });
    }

    private getMaxCanvasSize() {
        return {
            width: window.innerWidth * 0.9,
            height: window.innerHeight * 0.75,
        };
    }
    private resizeCanvas(width: number, height: number) {
        this.canvas.setDimensions({ width, height }, { cssOnly: false });
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    }


    private async loadWatermark() {
        try {
            this.watermark = await fabric.FabricImage.fromURL('/assets/watermark.png');
            this.watermark.set({
                originX: 'center',
                originY: 'center',
                left: this.canvas.getWidth() * 0.9,
                top: this.canvas.getHeight() * 0.9,
                selectable: false,
                evented: false,
            });
            this.canvas.add(this.watermark);
            this.canvas.renderAll();
        } catch (error) {
            console.error('Cant load watermark', error);
        }
    }

    onFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            if (this.image) {
                this.canvas.remove(this.image);
            }
            if (this.watermark) {
                this.canvas.remove(this.watermark);
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
