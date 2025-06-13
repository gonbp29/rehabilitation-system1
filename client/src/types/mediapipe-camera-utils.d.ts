// src/types/mediapipe-camera-utils.d.ts

declare module "@mediapipe/camera_utils/camera_utils" {
    /**
     * A rough shape of Camera—tweak as you discover the real API.
     */
    export class Camera {
        constructor(
            videoElement: HTMLVideoElement,
            options?: {
                onFrame?: () => void;
                width?: number;
                height?: number;
            }
        );
        start(): void;
        stop(): void;
    }
}
