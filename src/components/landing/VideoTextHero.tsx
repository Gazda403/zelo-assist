'use client';

import { useEffect, useRef } from 'react';

export function VideoTextHero() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Forced play on mount
        video.play().catch(() => { });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        video.play().catch(() => { });
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(video);

        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* SVG Filter */}
            <svg aria-hidden="true" width="0" height="0" className="fixed">
                <filter id="extract" x="-20%" y="-20%" width="140%" height="140%">
                    <feFlood floodColor="#FAFAF9" result="bg" />
                    <feComposite in="bg" in2="SourceGraphic" operator="out" />
                </filter>
            </svg>

            {/* Video Text Section */}
            <section className="py-16 bg-[#FAFAF9] overflow-hidden border-none outline-none">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative">
                        {/* Left Side Text */}
                        <div className="flex-1 text-center lg:text-right space-y-4 max-w-sm hidden md:block relative z-10">
                            <h3 className="text-xl font-bold text-primary italic uppercase tracking-wider">AI Intelligence</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                                Automatically categorizes and prioritizes your incoming mail, summarizes long threads, and highlights urgent requests.
                            </p>
                        </div>

                        {/* Central Hero */}
                        <div className="video-text-container shrink-0 border-none outline-none relative z-0">
                            <video
                                ref={videoRef}
                                src="/13068027_1920_1080_25fps.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover border-none outline-none"
                            />
                            <div className="text-box border-none outline-none">
                                <div className="text-content border-none outline-none">
                                    <span>Save</span>
                                    <span>Time</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side Text */}
                        <div className="flex-1 text-center lg:text-left space-y-4 max-w-sm hidden md:block relative z-10">
                            <h3 className="text-xl font-bold text-accent italic uppercase tracking-wider">Smart Drafting</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                                Generate perfect, context-aware replies in seconds. Set automated follow-ups to ensure you never miss an opportunity.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .video-text-container {
                    display: grid;
                    width: fit-content;
                    position: relative;
                    border: none;
                    outline: none;
                }

                .video-text-container > * {
                    grid-area: 1 / 1;
                }

                .text-box {
                    display: grid;
                    position: relative;
                    z-index: 1;
                    border: none;
                    outline: none;
                }

                .text-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 6rem;
                    z-index: 1;
                    font-size: clamp(2.2rem, 15vw, 13.2rem);
                    font-weight: 900;
                    line-height: 0.8;
                    letter-spacing: -0.02em;
                    text-align: center;
                    text-transform: uppercase;
                    font-family: 'Rubik', sans-serif;
                    border: none;
                    outline: none;
                    
                    /* Visual Effect */
                    --c: #FFFFFF;
                    color: var(--c);
                    filter: url(#extract);
                }

                .text-content span {
                    display: block;
                    transform: scaleX(1.3);
                    transform-origin: center;
                }

                .text-content::selection {
                    color: #1C1917;
                    background: rgb(from currentcolor r g b / 0.3);
                    text-shadow: 0 0 1px, 0 0 2px;
                }

                @media (max-width: 768px) {
                    .text-content {
                        font-size: 22vw;
                        padding: 1rem 0;
                    }
                }

                @media (forced-colors: active) {
                    .text-content {
                        filter: none;
                        color: CanvasText;
                        background: Canvas;
                    }
                }
            `}</style>
        </>
    );
}
