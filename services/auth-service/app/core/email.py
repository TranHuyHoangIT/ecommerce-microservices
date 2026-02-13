# Service: Auth Service  
# Responsibility: Email notifications
# Architecture: Resend API (recommended) or SMTP fallback

import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os

try:
    import resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False

class EmailService:
    """Handle email sending for user notifications"""
    
    def __init__(self):
        # Resend API (recommended - no personal credentials needed)
        self.resend_api_key = os.getenv("RESEND_API_KEY", "")
        
        # SMTP fallback config
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        
        # Sender info
        self.from_email = os.getenv("FROM_EMAIL", "onboarding@resend.dev")
        self.from_name = os.getenv("FROM_NAME", "HoangTranShop")
        
        # Configure Resend if available
        if RESEND_AVAILABLE and self.resend_api_key:
            resend.api_key = self.resend_api_key
        
    def generate_temp_password(self, length: int = 12) -> str:
        """Generate a random temporary password"""
        # Mix of letters, digits and special characters
        import string
        characters = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(secrets.choice(characters) for _ in range(length))
    
    def send_welcome_email(self, to_email: str, full_name: str, temp_password: str, role: str) -> bool:
        """
        Send welcome email with temporary password to new user
        
        Args:
            to_email: Recipient email address
            full_name: User's full name
            temp_password: Temporary password for first login
            role: User role (customer or staff)
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        # Role display
        role_display = {
            'customer': 'Khách hàng',
            'staff': 'Nhân viên'
        }.get(role, role)
        
        try:
            # Priority 1: Use Resend API (recommended)
            if RESEND_AVAILABLE and self.resend_api_key:
                return self._send_via_resend(to_email, full_name, temp_password, role_display)
            
            # Priority 2: Use SMTP if configured
            elif self.smtp_user and self.smtp_password:
                return self._send_via_smtp(to_email, full_name, temp_password, role_display)
            
            # Priority 3: Development mode (just print)
            else:
                print(f"[DEV MODE] Email to {to_email}")
                print(f"Password: {temp_password}")
                print(f"Configure RESEND_API_KEY or SMTP credentials to send real emails")
                return True
                
        except Exception as e:
            print(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def _send_via_resend(self, to_email: str, full_name: str, temp_password: str, role_display: str) -> bool:
        """Send email using Resend API"""
        html = self._get_email_html(to_email, full_name, temp_password, role_display)
        
        try:
            resend.Emails.send({
                "from": f"{self.from_name} <{self.from_email}>",
                "to": [to_email],
                "subject": f"Chào mừng đến với {self.from_name}!",
                "html": html
            })
            print(f"✅ Email sent via Resend to {to_email}")
            return True
        except Exception as e:
            print(f"❌ Resend API error: {str(e)}")
            return False
    
    def _send_via_smtp(self, to_email: str, full_name: str, temp_password: str, role_display: str) -> bool:
        """Send email using SMTP"""
        html = self._get_email_html(to_email, full_name, temp_password, role_display)
        
        # Create email
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"Chào mừng đến với {self.from_name}!"
        msg['From'] = f"{self.from_name} <{self.from_email}>"
        msg['To'] = to_email
        msg.attach(MIMEText(html, 'html'))
        
        # Send via SMTP
        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)
        
        print(f"✅ Email sent via SMTP to {to_email}")
        return True
    
    def _get_email_html(self, to_email: str, full_name: str, temp_password: str, role_display: str) -> str:
        """Generate HTML email template"""
        return f"""

            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Chào mừng đến với {self.from_name}!</h1>
                  </div>
                  
                  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p style="font-size: 16px;">Xin chào <strong>{full_name}</strong>,</p>
                    
                    <p style="font-size: 16px;">
                      Chúc mừng! Tài khoản của bạn đã được tạo thành công với vai trò <strong>{role_display}</strong>.
                    </p>
                    
                    <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0 0 10px 0; font-weight: bold;">Thông tin đăng nhập:</p>
                      <p style="margin: 5px 0;"><strong>Email:</strong> {to_email}</p>
                      <p style="margin: 5px 0;"><strong>Mật khẩu tạm thời:</strong> <code style="background: #e0e0e0; padding: 5px 10px; border-radius: 4px; font-size: 14px;">{temp_password}</code></p>
                    </div>
                    
                    <p style="font-size: 14px; color: #e74c3c;">
                      <strong>⚠️ Lưu ý quan trọng:</strong><br>
                      Đây là mật khẩu tạm thời. Vui lòng đăng nhập và đổi mật khẩu ngay sau lần đăng nhập đầu tiên để đảm bảo an toàn tài khoản.
                    </p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="http://localhost:3000/login" 
                         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                color: white; 
                                padding: 12px 30px; 
                                text-decoration: none; 
                                border-radius: 25px; 
                                font-weight: bold;
                                display: inline-block;">
                        Đăng nhập ngay
                      </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #999; text-align: center;">
                      Nếu bạn không yêu cầu tạo tài khoản này, vui lòng bỏ qua email này.<br>
                      © 2026 {self.from_name}. All rights reserved.
                    </p>
                  </div>
                </div>
              </body>
            </html>
            """
    
    def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        """Send password reset email (for future use)"""
        # TODO: Implement password reset email
        pass

# Singleton instance
email_service = EmailService()
