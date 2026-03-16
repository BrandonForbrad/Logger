const { uploadOverlayCss, uploadOverlayHtml, uploadOverlayClientJs } = require('./shared');

function profilePage({ usernameEscaped, profilePicture, discordId, discordUsername, discordOAuthEnabled, message }) {
  const msgHtml = message
    ? `<div class="msg ${message.type === 'error' ? 'msg-error' : 'msg-ok'}">${message.text}</div>`
    : '';
  const avatarSrc = profilePicture || '';
  const hasAvatar = !!avatarSrc;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Manage Profile</title>
    <style>
      body { font-family: system-ui, sans-serif; margin:0; background:#f3f4f6; }
      .shell { min-height:100vh; display:flex; align-items:flex-start; justify-content:center; padding:24px 12px; }
      .card {
        background:white;
        padding:22px 24px;
        border-radius:16px;
        border:1px solid #e5e7eb;
        box-shadow:0 10px 25px rgba(15,23,42,0.08);
        width:100%;
        max-width:520px;
      }
      h1 { margin:0 0 8px; font-size:20px; }
      h2 { margin:18px 0 8px; font-size:16px; border-bottom:1px solid #e5e7eb; padding-bottom:6px; }
      p.sub { margin:0 0 14px; font-size:13px; color:#6b7280; }
      label { font-size:13px; font-weight:500; display:block; margin-bottom:4px; }
      input[type="password"], input[type="file"] {
        padding:8px 10px;
        width:100%;
        margin:0 0 12px;
        border-radius:10px;
        border:1px solid #d1d5db;
        font-family:inherit;
        font-size:13px;
      }
      button {
        padding:8px 14px;
        border-radius:999px;
        border:none;
        background:#00a2ff;
        color:white;
        font-weight:500;
        cursor:pointer;
        font-size:13px;
      }
      button.danger {
        background:#e11d48;
      }
      a { font-size:12px; color:#6b7280; text-decoration:none; }
      a:hover { text-decoration:underline; }
      .top-link { margin-bottom:10px; font-size:12px; }
      .avatar-section { display:flex; align-items:center; gap:16px; margin-bottom:14px; }
      .avatar-preview {
        width:80px;
        height:80px;
        border-radius:50%;
        background:#e5e7eb;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:28px;
        font-weight:700;
        color:#6b7280;
        overflow:hidden;
        flex-shrink:0;
      }
      .avatar-preview img {
        width:100%;
        height:100%;
        object-fit:cover;
      }
      .avatar-actions { flex:1; }
      .msg {
        padding:8px 12px;
        border-radius:8px;
        font-size:13px;
        margin-bottom:12px;
      }
      .msg-ok { background:#dcfce7; color:#166534; border:1px solid #bbf7d0; }
      .msg-error { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; }
      .hint { font-size:11px; color:#6b7280; margin-top:-8px; margin-bottom:10px; }
      ${uploadOverlayCss()}
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="card">
        <div class="top-link"><a href="/">⬅ Back to logs</a></div>
        <h1>Manage Profile</h1>
        <p class="sub">Update your profile picture and change your password.</p>

        ${msgHtml}

        <h2>Profile Picture</h2>
        <div class="avatar-section">
          <div class="avatar-preview">
            ${hasAvatar
              ? `<img src="${avatarSrc}" alt="Profile picture" />`
              : usernameEscaped.charAt(0).toUpperCase()
            }
          </div>
          <div class="avatar-actions">
            <form method="POST" action="/profile/picture" enctype="multipart/form-data" data-upload-progress>
              <label>Upload new picture</label>
              <input type="file" name="avatar" accept="image/*" required />
              <div class="hint">JPG, PNG, or GIF. Max 5 MB. Will be cropped to a circle.</div>
              <button type="submit">Upload Picture</button>
            </form>
            ${hasAvatar ? `
            <form method="POST" action="/profile/picture/remove" style="margin-top:8px;">
              <button type="submit" class="danger">Remove Picture</button>
            </form>
            ` : ''}
          </div>
        </div>

        <h2>Change Password</h2>
        <form method="POST" action="/profile/password">
          <label>Current password</label>
          <input type="password" name="current_password" required />
          <label>New password</label>
          <input type="password" name="new_password" required />
          <label>Confirm new password</label>
          <input type="password" name="confirm_password" required />
          <button type="submit">Update Password</button>
        </form>

        <h2>Discord Notifications</h2>
        ${discordId
          ? `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:10px 14px;background:#dcfce7;border:1px solid #bbf7d0;border-radius:10px;">
               <span style="font-size:20px;">✓</span>
               <div>
                 <div style="font-size:13px;font-weight:600;color:#166534;">Discord linked${discordUsername ? ` as ${discordUsername}` : ''}</div>
                 <div style="font-size:11px;color:#166534;">ID: ${discordId}</div>
               </div>
               <form method="POST" action="/profile/discord" style="margin-left:auto;">
                 <input type="hidden" name="discord_id" value="" />
                 <button type="submit" class="danger" style="font-size:11px;padding:4px 10px;">Unlink</button>
               </form>
             </div>`
          : `${discordOAuthEnabled
              ? `<a href="/auth/discord" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;background:#5865F2;color:white;font-size:13px;font-weight:600;text-decoration:none;margin-bottom:12px;">
                   <svg width="20" height="15" viewBox="0 0 71 55" fill="white"><path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A39 39 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.2a58.9 58.9 0 0017.7 9a.2.2 0 00.3-.1 42.1 42.1 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.7.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.5 2.7.2.2 0 00-.1.3 47.3 47.3 0 003.6 5.9.2.2 0 00.3.1A58.7 58.7 0 0070.3 45.7v-.2c1.4-15-2.3-28.4-9.9-40.1a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.3-3.2-6.3-7s2.8-7 6.3-7 6.4 3.2 6.3 7-2.8 7-6.3 7zm23.2 0c-3.5 0-6.3-3.2-6.3-7s2.8-7 6.3-7 6.4 3.2 6.3 7-2.8 7-6.3 7z"/></svg>
                   Link with Discord
                 </a>
                 <div style="font-size:11px;color:#6b7280;margin-bottom:10px;">Click to sign in with Discord and automatically link your account.</div>`
              : ''
            }
            <details${discordOAuthEnabled ? '' : ' open'} style="margin-bottom:4px;">
              <summary style="font-size:12px;color:#6b7280;cursor:pointer;margin-bottom:8px;">${discordOAuthEnabled ? 'Or enter manually' : 'Enter your Discord User ID'}</summary>
              <form method="POST" action="/profile/discord">
                <label>Discord User ID</label>
                <input type="text" name="discord_id" value="" placeholder="e.g. 123456789012345678" style="padding:8px 10px;width:100%;margin:0 0 4px;border-radius:10px;border:1px solid #d1d5db;font-family:inherit;font-size:13px;box-sizing:border-box;" />
                <div class="hint">Enter your 17-20 digit Discord User ID to receive DMs when @mentioned in chat.<br>To find it: enable Developer Mode in Discord (Settings → Advanced), then right-click your username → Copy User ID.</div>
                <button type="submit">Save Discord ID</button>
              </form>
            </details>`
        }
      </div>
    </div>

    ${uploadOverlayHtml()}
    <script>
      ${uploadOverlayClientJs()}
      if (window.__dlUpload) window.__dlUpload.bindAll();
    </script>
  </body>
  </html>
  `;
}

module.exports = {
  profilePage,
};
