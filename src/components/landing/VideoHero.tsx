import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface VideoHeroProps {
    frameCount: number;
    fps?: number;
    loop?: boolean;
    onComplete?: () => void;
}

/**
 * Canvas-based video frame player for smooth animation playback
 * Renders sequential image frames at specified FPS using requestAnimationFrame
 */
const VideoHero: React.FC<VideoHeroProps> = ({
    frameCount,
    fps = 30,
    loop = true,
    onComplete
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const framesRef = useRef<HTMLImageElement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState(0);
    const [currentFrame, setCurrentFrame] = useState(0);
    const rafIdRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // Preload all frames
    useEffect(() => {
        const loadFrames = async () => {
            const frames: HTMLImageElement[] = [];
            let loadedCount = 0;

            const loadPromises = Array.from({ length: frameCount }, (_, i) => {
                return new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new Image();
                    const frameNum = String(i + 1).padStart(3, '0');
                    img.src = `/video-frames/ezgif-frame-${frameNum}.jpg`;

                    img.onload = () => {
                        loadedCount++;
                        setLoadProgress((loadedCount / frameCount) * 100);
                        resolve(img);
                    };

                    img.onerror = () => {
                        console.error(`Failed to load frame ${frameNum}`);
                        // Create empty image as fallback
                        resolve(img);
                    };

                    frames[i] = img;
                });
            });

            await Promise.all(loadPromises);
            framesRef.current = frames;
            setIsLoading(false);
        };

        loadFrames();
    }, [frameCount]);

    // Canvas setup and resize handling
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || isLoading || framesRef.current.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const setCanvasSize = () => {
            const firstFrame = framesRef.current[0];
            if (firstFrame && firstFrame.complete) {
                const aspectRatio = firstFrame.naturalWidth / firstFrame.naturalHeight;
                const containerWidth = canvas.parentElement?.clientWidth || 1200;
                const dpr = window.devicePixelRatio || 1;

                // Set logical (CSS) size
                canvas.style.width = `${containerWidth}px`;
                canvas.style.height = `${containerWidth / aspectRatio}px`;

                // Set physical (drawing) size
                canvas.width = containerWidth * dpr;
                canvas.height = (containerWidth / aspectRatio) * dpr;

                // Scale context to match physical size
                ctx.scale(dpr, dpr);
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
            }
        };

        setCanvasSize();

        const handleResize = () => {
            setCanvasSize();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isLoading]);

    // Animation loop
    useEffect(() => {
        if (isLoading || !canvasRef.current || framesRef.current.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const frameDuration = 1000 / fps; // milliseconds per frame
        let frameIndex = 0;
        let hasCompleted = false;

        const drawFrame = (index: number) => {
            const frame = framesRef.current[index];
            if (frame && frame.complete) {
                const aspectRatio = frame.naturalWidth / frame.naturalHeight;
                const containerWidth = canvas.parentElement?.clientWidth || 1200;

                ctx.clearRect(0, 0, containerWidth, containerWidth / aspectRatio);
                ctx.drawImage(frame, 0, 0, containerWidth, containerWidth / aspectRatio);
                setCurrentFrame(index);
            }
        };

        const animate = (currentTime: number) => {
            if (lastTimeRef.current === 0) {
                lastTimeRef.current = currentTime;
            }

            const deltaTime = currentTime - lastTimeRef.current;

            if (deltaTime >= frameDuration) {
                drawFrame(frameIndex);

                frameIndex++;

                // Handle loop or completion
                if (frameIndex >= frameCount) {
                    if (loop) {
                        frameIndex = 0;
                    } else {
                        frameIndex = frameCount - 1;
                        if (!hasCompleted) {
                            hasCompleted = true;
                            onComplete?.();
                            return; // Stop animation
                        }
                    }
                }

                lastTimeRef.current = currentTime;
            }

            rafIdRef.current = requestAnimationFrame(animate);
        };

        // Start animation
        rafIdRef.current = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [isLoading, fps, frameCount, loop, onComplete]);

    return (
        <div className="relative w-full">
            {/* Loading State */}
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5F2ED]"
                    style={{ minHeight: '400px' }}
                >
                    <div className="w-64 space-y-4">
                        <div className="flex items-center justify-center">
                            <svg
                                className="animate-spin h-8 w-8 text-[#FF8247]"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#FF8247] rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${loadProgress}%` }}
                                    transition={{ duration: 0.2 }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 text-center font-medium">
                                Loading XELOFLOW... {Math.round(loadProgress)}%
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Canvas */}
            <motion.canvas
                ref={canvasRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ duration: 0.6 }}
                className="w-full h-auto"
                style={{
                    display: 'block',
                    backgroundColor: '#F5F2ED'
                }}
            />
        </div>
    );
};

export default VideoHero;
