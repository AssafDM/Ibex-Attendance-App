import React, { useState } from "react";
import { Bell, LucideLogOut, SquarePen } from "lucide-react";
import { signOut, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

function toTitleCase(str) {
  //utility function
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
/**the setting menu component */
export default function SettingsMenu({ user }) {
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(user.displayName);
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/"; // redirect after logout
  };
  /**
   * request premission to send push
   * @returns push token
   */
  async function enablePush() {
    if (!(await isSupported())) return null;
    if (Notification.permission !== "granted") {
      const p = await Notification.requestPermission();
      if (p !== "granted") return null;
    } else {
      alert(
        "Premission Already Granted!\nTry Allowing It In Your Phone Settings."
      );
    }

    const swReg = await navigator.serviceWorker.ready;
    const token = await getToken(getMessaging(), {
      vapidKey: import.meta.env.VITE_FB_VAPID_KEy,
      serviceWorkerRegistration: swReg,
    });
    if (!token) return null;

    const uid = user.uid;
    const ref = doc(db, "users", uid, "fcmTokens", token);
    await setDoc(ref, {
      token,
      updatedAt: serverTimestamp(),
      ua: navigator.userAgent,
      active: true,
    });

    return token;
  }
  return (
    <div className="flex flex-col gap-5 p-5 ">
      <div className="flex justify-between">
        <div className=" text-left text-lg">Log Out</div>

        <LucideLogOut onClick={handleLogout} />
      </div>
      <div className="flex justify-between">
        <div className=" text-left text-lg">Allow Notifications</div>
        <Bell onClick={enablePush} />
      </div>
      <div>
        <div className="flex justify-between">
          <div className=" text-left text-lg">change name</div>
          <SquarePen
            onClick={() => {
              setEditName(!editName);
            }}
          />
        </div>
        {editName && (
          <div>
            <textarea
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="now-resize w-full rounded-lg border px-3 py-2"
              rows={1}
              placeholder="Title"
              style={{ resize: "none", overflow: "auto" }}
              maxLength={35}
            />
            <button
              type="button"
              onClick={async () => {
                await updateProfile(user, {
                  displayName: toTitleCase(name),
                });
                setEditName(false);
              }}
              className="w-full rounded-lg border-white text-white px-4 py-2 bg-ibex-gold"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
