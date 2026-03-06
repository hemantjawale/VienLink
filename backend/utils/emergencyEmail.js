import nodemailer from 'nodemailer';

// Create reusable transporter
let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;

    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!host || !user || !pass || user === 'your_email@gmail.com') {
        console.warn('⚠️  Email not configured — skipping email notifications. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env');
        return null;
    }

    transporter = nodemailer.createTransport({
        host,
        port: Number(port) || 587,
        secure: Number(port) === 465,
        auth: { user, pass },
    });

    // Verify connection on first use
    transporter.verify((err) => {
        if (err) {
            console.error('❌ Email transporter verification failed:', err.message);
            transporter = null;
        } else {
            console.log('✅ Email transporter ready');
        }
    });

    return transporter;
};

// ============================================================
// Send emergency alert email to a donor
// ============================================================
export const sendEmergencyAlertEmail = async (donor, emergencyRequest) => {
    const transport = getTransporter();
    if (!transport) return { success: false, reason: 'Email not configured' };

    const { bloodGroup, patientName, patientLocation, _id: requestId } = emergencyRequest;
    const donorName = `${donor.firstName} ${donor.lastName}`;
    const distanceKm = donor._distanceKm != null ? `${donor._distanceKm} km` : 'nearby';

    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);padding:30px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                🚨 EMERGENCY BLOOD REQUEST
              </h1>
              <p style="margin:8px 0 0;color:#fecaca;font-size:14px;">
                A patient near you urgently needs blood
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;font-size:16px;color:#374151;line-height:1.6;">
                Dear <strong>${donorName}</strong>,
              </p>
              
              <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.6;">
                A nearby patient urgently needs <strong style="color:#dc2626;font-size:18px;">${bloodGroup}</strong> blood. 
                You are <strong>${distanceKm}</strong> away from the patient's location.
              </p>

              <!-- Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border-radius:8px;border:1px solid #fecaca;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <table width="100%">
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;width:40%;">Patient Name:</td>
                        <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${patientName}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;">Blood Group Needed:</td>
                        <td style="padding:6px 0;color:#dc2626;font-size:16px;font-weight:700;">${bloodGroup}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;">Your Distance:</td>
                        <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${distanceKm}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;">Request ID:</td>
                        <td style="padding:6px 0;color:#6b7280;font-size:12px;font-family:monospace;">${requestId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                If you are available and willing to donate, please respond through the VienLink application 
                or contact your nearest registered hospital immediately.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:14px;color:#6b7280;">
                      Please log into the <strong>VienLink</strong> app or contact your hospital to respond.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border-radius:8px;border:1px solid #fde68a;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                      ⏰ <strong>Time is critical.</strong> Every minute counts in an emergency. 
                      If you cannot donate, please ignore this message — the system will automatically 
                      notify other available donors.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f3f4f6;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
                This is an automated emergency alert from VienLink Blood Bank Management System.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} VienLink. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const textContent = `EMERGENCY BLOOD REQUEST

Dear ${donorName},

A nearby patient urgently needs ${bloodGroup} blood. You are ${distanceKm} away from the patient's location.

Patient: ${patientName}
Blood Group Needed: ${bloodGroup}
Distance: ${distanceKm}
Request ID: ${requestId}

If you are available to donate, please respond through the VienLink app or contact your nearest registered hospital.

Time is critical — every minute counts in an emergency.

— VienLink Blood Bank Management System`;

    try {
        const info = await transport.sendMail({
            from,
            to: donor.email,
            subject: `🚨 EMERGENCY: ${bloodGroup} Blood Needed Urgently — ${distanceKm} from you`,
            text: textContent,
            html: htmlContent,
        });

        console.log(`📧 Emergency email sent to ${donor.email} (${donorName}) — Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`❌ Failed to send emergency email to ${donor.email}:`, err.message);
        return { success: false, reason: err.message };
    }
};

// ============================================================
// Send email to patient when donor accepts
// ============================================================
export const sendDonorAcceptedEmail = async (patientEmail, patientName, donor, emergencyRequest) => {
    const transport = getTransporter();
    if (!transport) return { success: false, reason: 'Email not configured' };

    const donorName = `${donor.firstName} ${donor.lastName}`;
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);padding:30px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">
                ✅ DONOR FOUND!
              </h1>
              <p style="margin:8px 0 0;color:#bbf7d0;font-size:14px;">
                A donor has accepted your emergency blood request
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;font-size:16px;color:#374151;line-height:1.6;">
                Dear <strong>${patientName}</strong>,
              </p>
              
              <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.6;">
                Great news! A donor has accepted your emergency request for 
                <strong style="color:#dc2626;">${emergencyRequest.bloodGroup}</strong> blood.
              </p>

              <!-- Donor Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#166534;">Donor Details:</p>
                    <table width="100%">
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;width:35%;">Name:</td>
                        <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${donorName}</td>
                      </tr>
                      ${donor.phone ? `
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;">Phone:</td>
                        <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">
                          <a href="tel:${donor.phone}" style="color:#16a34a;text-decoration:none;">${donor.phone}</a>
                        </td>
                      </tr>` : ''}
                      ${donor.email ? `
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;">Email:</td>
                        <td style="padding:6px 0;color:#111827;font-size:14px;">
                          <a href="mailto:${donor.email}" style="color:#16a34a;text-decoration:none;">${donor.email}</a>
                        </td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:14px;">Blood Group:</td>
                        <td style="padding:6px 0;color:#dc2626;font-size:16px;font-weight:700;">${donor.bloodGroup}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
                Please contact the donor as soon as possible to coordinate the blood donation.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f3f4f6;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
                This is an automated notification from VienLink Blood Bank Management System.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} VienLink. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
        const info = await transport.sendMail({
            from,
            to: patientEmail,
            subject: `✅ Donor Found for ${emergencyRequest.bloodGroup} Blood — VienLink Emergency`,
            text: `Dear ${patientName},\n\nA donor has accepted your emergency request for ${emergencyRequest.bloodGroup} blood.\n\nDonor: ${donorName}\nPhone: ${donor.phone || 'N/A'}\nEmail: ${donor.email || 'N/A'}\nBlood Group: ${donor.bloodGroup}\n\nPlease contact the donor as soon as possible.\n\n— VienLink`,
            html: htmlContent,
        });

        console.log(`📧 Donor-accepted email sent to patient ${patientEmail} — Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`❌ Failed to send donor-accepted email to ${patientEmail}:`, err.message);
        return { success: false, reason: err.message };
    }
};

export default {
    sendEmergencyAlertEmail,
    sendDonorAcceptedEmail,
};
