// ===================================================================
// Webcam access + permission handling for the in-browser CV.
// ===================================================================

export type CamPermission = "granted" | "denied" | "prompt" | "unknown";

/** Best-effort current permission state (not all browsers support this query). */
export async function getCameraPermission(): Promise<CamPermission> {
  try {
    // `camera` isn't in the standard PermissionName union in all TS libs.
    const status = await navigator.permissions.query({
      name: "camera" as PermissionName,
    });
    return status.state as CamPermission;
  } catch {
    return "unknown";
  }
}

/** Request the webcam. Throws a friendly Error if the user denies or none exists. */
export async function requestWebcam(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser does not support camera access.");
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      audio: false,
    });
  } catch (e) {
    const name = (e as DOMException)?.name;
    if (name === "NotAllowedError" || name === "SecurityError") {
      throw new Error("Camera permission was denied. Allow camera access and try again.");
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      throw new Error("No camera was found on this device.");
    }
    throw new Error("Could not access the camera.");
  }
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((t) => t.stop());
}
