import { I } from "../icons";
import { avatarColor, initials } from "../helpers";
import type { User } from "../types";

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileModal({ user, onClose, onLogout }: ProfileModalProps) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
        <div className="profile-avatar-lg" style={{ background: avatarColor(user.name) }}>
          {initials(user.name)}
        </div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-role">{user.role}</div>
        <div className="profile-divider" />
        <div className="profile-row">
          <div className="profile-ico">
            <I.Mail />
          </div>
          <div>
            <div className="profile-info-lbl">Email</div>
            <div className="profile-info-val">{user.email}</div>
          </div>
        </div>
        <div className="profile-row">
          <div className="profile-ico">
            <I.Phone />
          </div>
          <div>
            <div className="profile-info-lbl">Agence</div>
            <div className="profile-info-val">{user.agence}</div>
          </div>
        </div>
        <div className="profile-divider" />
        <button className="btn-red btn-full" onClick={onLogout}>
          <I.LogOut /> Se déconnecter
        </button>
        <button className="btn-gray btn-full" style={{ marginTop: 8 }} onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
}
