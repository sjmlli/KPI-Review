from typing import Dict

from .models import LeaveRequest


def _base_template(title: str, body: str) -> str:
    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 24px; border: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 16px; color: #111827;">{title}</h2>
          <div style="color: #374151; font-size: 14px; line-height: 1.6;">
            {body}
          </div>
        </div>
      </body>
    </html>
    """


def leave_request_created_email(leave_request: LeaveRequest) -> Dict[str, str]:
    subject = f"Leave request submitted - {leave_request.employee.full_name}"
    body = f"""
      <p>A leave request has been submitted.</p>
      <ul>
        <li><strong>Employee:</strong> {leave_request.employee.full_name}</li>
        <li><strong>Type:</strong> {leave_request.leave_type}</li>
        <li><strong>Dates:</strong> {leave_request.start_date} to {leave_request.end_date}</li>
        <li><strong>Total Days:</strong> {leave_request.total_days}</li>
        <li><strong>Reason:</strong> {leave_request.reason}</li>
        <li><strong>Status:</strong> {leave_request.status}</li>
      </ul>
    """
    return {
        'subject': subject,
        'html': _base_template('Leave Request Submitted', body),
    }


def leave_request_approved_email(leave_request: LeaveRequest) -> Dict[str, str]:
    subject = f"Leave approved - {leave_request.employee.full_name}"
    body = f"""
      <p>The leave request has been approved.</p>
      <ul>
        <li><strong>Employee:</strong> {leave_request.employee.full_name}</li>
        <li><strong>Type:</strong> {leave_request.leave_type}</li>
        <li><strong>Dates:</strong> {leave_request.start_date} to {leave_request.end_date}</li>
        <li><strong>Total Days:</strong> {leave_request.total_days}</li>
        <li><strong>Status:</strong> {leave_request.status}</li>
      </ul>
    """
    return {
        'subject': subject,
        'html': _base_template('Leave Request Approved', body),
    }


def leave_request_rejected_email(leave_request: LeaveRequest) -> Dict[str, str]:
    subject = f"Leave rejected - {leave_request.employee.full_name}"
    body = f"""
      <p>The leave request has been rejected.</p>
      <ul>
        <li><strong>Employee:</strong> {leave_request.employee.full_name}</li>
        <li><strong>Type:</strong> {leave_request.leave_type}</li>
        <li><strong>Dates:</strong> {leave_request.start_date} to {leave_request.end_date}</li>
        <li><strong>Total Days:</strong> {leave_request.total_days}</li>
        <li><strong>Status:</strong> {leave_request.status}</li>
        <li><strong>Reason:</strong> {leave_request.rejection_reason or '-'}</li>
      </ul>
    """
    return {
        'subject': subject,
        'html': _base_template('Leave Request Rejected', body),
    }
