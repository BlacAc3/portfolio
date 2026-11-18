/** Fire after a message sends: the Contact-page paper plane does a loop. */
export const PLANE_LAUNCH_EVENT = "plane:launch";
export const launchPlane = () => window.dispatchEvent(new Event(PLANE_LAUNCH_EVENT));
