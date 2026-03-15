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
    watermark_image!: fabric.FabricImage | null;

    cropRect: fabric.Rect | null = null;
    overlay: fabric.Rect | null = null;

    watermark_positions: { label: string; halign: number; valign: number }[] = [
        { label: 'top left', halign: -1, valign: -1 },
        { label: 'top right', halign: 1, valign: -1 },
        { label: 'bottom left', halign: -1, valign: 1 },
        { label: 'bottom right', halign: 1, valign: 1 },
    ];
    watermark_pos = this.watermark_positions[2];

    selected_ratio = '3:4 (Insta Image)';
    ratios: [string, string, number][] = [
        ['crop_landscape', '1.91:1 (Insta Image)', 1.91],
        ['crop_square', '1:1 (Insta Image)', 1],
        ['crop_portrait', '3:4 (Insta Image)', 3.0 / 4.0],
        ['crop_portrait', '9:16 (Insta Reel or story)', 9.0 / 16.0],
    ];
    ngAfterViewInit() {
        this.canvas = new fabric.Canvas(this.canvasElement.nativeElement);
    }

    onStepChange(event: StepperSelectionEvent) {
        if (event.selectedIndex === 1) {
            this.applyCrop();
        } else {
        }
        if (event.selectedIndex > 2) {
            if (!this.cropRect) return;
            this.cropRect.set({
                selectable: false,
                evented: false,
            });
        }
        else {
            if (!this.cropRect) return;
            this.cropRect.set({
                selectable: true,
                evented: true,
            });
        }
    }

    onRatioChange() {
        if (this.stepper.selectedIndex === 1) {
            this.applyCrop();
        }
    }
    onWaterMarkPosChange() {
        this.updateWatermark();
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
        this.updateClip()
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
        this.updateWatermark()

        this.canvas.renderAll();
    }

    private resizeCanvas(width: number, height: number) {
        this.canvas.setDimensions({ width, height }, { cssOnly: false });
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    }
    private async loadWatermark() {
        if (this.watermark_image) return
        this.watermark_image = await fabric.FabricImage.fromURL('/assets/watermark.png');
        this.watermark_image.set({
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
        });
        this.canvas.add(this.watermark_image);
    }


    private updateWatermark() {
        if (!this.watermark_image) return;
        if (!this.cropRect) return;

        const bounds = this.cropRect.getBoundingRect();

        const proportion = 0.05;
        const halign = this.watermark_pos.halign;
        const valign = this.watermark_pos.valign;
        const border = 0.25;

        const orgWidth = bounds.width;
        const orgHeight = bounds.height;

        const areaOrg = orgWidth * orgHeight;
        const areaWm = this.watermark_image.width * this.watermark_image.height;

        const areaTarget = areaOrg * proportion;
        const scale = Math.sqrt(areaTarget / areaWm);

        this.watermark_image.scale(scale);

        const wmWidth = this.watermark_image.width * scale;
        const wmHeight = this.watermark_image.height * scale;

        const wmBorder = wmHeight * border;


        const left = bounds.left + (bounds.width) / 2 + halign * ((bounds.width - wmWidth) / 2 - wmBorder);
        const top = bounds.top + (bounds.height) / 2 + valign * ((bounds.height - wmHeight) / 2 - wmBorder);

        this.watermark_image.set({
            left,
            top
        });
        this.canvas.bringObjectToFront(this.watermark_image);
        this.canvas.renderAll();
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
                await this.loadWatermark();
                this.canvas.renderAll();
                this.stepper.next();
            };
            reader.readAsDataURL(file);
        }
    }
}
