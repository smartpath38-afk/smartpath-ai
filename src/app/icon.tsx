import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: "#0a0a0a",
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Head */}
        <div
          style={{
            position: "absolute",
            top: 5,
            left: 10,
            width: 12,
            height: 12,
            borderRadius: 6,
            background: "white",
          }}
        />
        {/* Shoulders */}
        <div
          style={{
            position: "absolute",
            bottom: -5,
            left: 3,
            width: 26,
            height: 16,
            borderRadius: "50%",
            background: "white",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
