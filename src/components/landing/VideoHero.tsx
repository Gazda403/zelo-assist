
"use client";
import React, { useEffect, useRef, useState } from 'react';

const VideoHero = ({ frameCount = 129 }) => {
    const [isLoading, setIsLoading] = useState(true);
    return (
        <div className="relative w-full h-[400px] bg-[#F5F2ED] flex items-center justify-center rounded-3xl overflow-hidden">
            <p className="text-gray-400 font-medium">ZELO Dashboard Preview</p>
        </div>
    );
};
export default VideoHero;
