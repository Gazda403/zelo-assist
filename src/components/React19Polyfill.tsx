"use client";

import React from "react";

// React 19 polyfill: some packages (like @splinetool/react-spline 2.2.6) still access
// React.ReactCurrentOwner which was removed in React 19.
if (typeof window !== "undefined" && !(React as any).ReactCurrentOwner) {
    (React as any).ReactCurrentOwner = { current: null };
}

export function React19Polyfill() {
    return null;
}
