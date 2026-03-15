import { Component, ViewChild, ElementRef, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
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
    @ViewChild('editstepper') stepper!: MatStepper;

    fileName = '';
    canvas!: fabric.Canvas;
    image!: fabric.FabricImage;
    watermark_image!: fabric.FabricImage;
    watermark_pos = 'bottom_left'

    cropRect: fabric.Rect | null = null;
    overlay: fabric.Rect | null = null;

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
        this.canvas = new fabric.Canvas(this.canvasElement.nativeElement);
    }

    onStepChange(event: StepperSelectionEvent) {
        if (event.selectedIndex === 1) {
            this.applyCrop();
        } else {
        }
    }

    onRatioChange() {
        if (this.stepper.selectedIndex === 1) {
            this.applyCrop();
        }
    }

    private applyCrop() {
        if (!this.image) return;

        // Remove old crop elements
        if (this.cropRect) {
            this.canvas.remove(this.cropRect);
            this.cropRect = null;
        }
        if (this.overlay) {
            this.canvas.remove(this.overlay);
        }

        // Parse ratio
        const [wStr, hStr] = this.selected_ratio.split(':');
        const w = parseFloat(wStr);
        const h = parseFloat(hStr);
        const ratio = w / h;
        console.log("Ratio is " + ratio)

        const imgWidth = this.image.width!;
        const imgHeight = this.image.height!;
        const imageScale = this.image.scaleX!;
        const imageLeft = this.image.left!;
        const imageTop = this.image.top!;
        console.log("imgWidth is " + imgWidth)
        console.log("imgHeight is " + imgHeight)
        console.log("imageScale is " + imageScale)
        console.log("imageLeft is " + imageLeft)
        console.log("imageTop is " + imageTop)

        // Calculate crop dimensions to fit within image
        let cropWidth, cropHeight;
        if (ratio < imgWidth / imgHeight) {
            cropHeight = imgHeight;
            cropWidth = imgHeight * ratio;
        } else {
            cropWidth = imgWidth;
            cropHeight = imgWidth / ratio;
        }

        console.log("cropHeight is " + cropHeight)
        console.log("cropHeight is " + cropWidth)


        // Convert to canvas coordinates
        const cropLeftCanvas = imageLeft;
        const cropTopCanvas = imageTop;
        const cropWidthCanvas = cropWidth;
        const cropHeightCanvas = cropHeight;

        this.overlay = new fabric.Rect({
            left: imageLeft,
            top: imageTop,
            width: imgWidth,
            height: imgHeight,
            fill: 'rgba(0,0,0,0.8)',
            selectable: false,
            evented: false
        });

        this.overlay.clipPath = new fabric.Rect({
            left: cropLeftCanvas,
            top: cropTopCanvas,
            width: cropWidthCanvas,
            height: cropHeightCanvas,
            absolutePositioned: true,
            inverted: true
        });

        this.cropRect = new fabric.Rect({
            left: cropLeftCanvas,
            top: cropTopCanvas,
            width: cropWidthCanvas,
            height: cropHeightCanvas,
            fill: 'transparent',
            stroke: 'white',
            strokeWidth: 2,
            selectable: true,
            hasControls: true,
            lockScalingFlip: true,
        });

        this.cropRect.setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false,
            mtr: false
        });

        this.canvas.add(this.cropRect);
        this.canvas.add(this.overlay);
        this.canvas.renderAll();
        this.cropRect.on('moving', () => this.updateClip());
        this.cropRect.on('scaling', () => this.updateClip());
    }
    private updateClip() {
        if (!this.cropRect) return
        if (!this.overlay) return
        if (!this.overlay.clipPath) return
        const rect = this.cropRect;

        this.overlay.clipPath.set({
            left: rect.left,
            top: rect.top,
            width: rect.width * rect.scaleX,
            height: rect.height * rect.scaleY
        });

        this.canvas.requestRenderAll();
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

                const imgWidth = this.image.width;
                const imgHeight = this.image.height;
                const scale = 1;


                this.resizeCanvas(imgWidth * scale, imgHeight * scale);

                this.image.set({
                    scaleX: scale,
                    scaleY: scale,
                    left: this.canvas.getWidth() / 2,
                    top: this.canvas.getHeight() / 2,
                    selectable: false,
                    evented: false,
                });
                this.canvas.add(this.image);
                this.canvas.renderAll();
                this.stepper.next();
            };
            reader.readAsDataURL(file);
        }
    }
}
