import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          fontFamily: "Impact, sans-serif",
          fontWeight: 900,
          fontSize: 64,
          lineHeight: 1,
          color: "#2563EB",
          WebkitTextStroke: "4px #F4C20D",
          paintOrder: "stroke fill",
        }}
      >
        M
      </div>
    ),
    { ...size }
  );
}
