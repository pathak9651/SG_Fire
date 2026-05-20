import { asyncHandler, ErrorResponse } from '../middleware/errorHandler.js';
import sendEmail from '../utils/sendEmail.js';

const subjectLabels = {
  sales: 'Product Sales & Quotes',
  service: 'Service & Maintenance',
  support: 'Technical Support',
  other: 'Other Inquiry',
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone = '', subject, message } = req.body;

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    throw new ErrorResponse('Name, email, subject, and message are required.', 400);
  }

  if (!isValidEmail(email)) {
    throw new ErrorResponse('Please provide a valid email address.', 400);
  }

  const recipient =
    process.env.CONTACT_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.COMPANY_EMAIL ||
    process.env.EMAIL_USER;

  if (!recipient) {
    throw new ErrorResponse('Contact email recipient is not configured.', 500);
  }

  const subjectLabel = subjectLabels[subject] || subject;
  const mailResult = await sendEmail({
    to: recipient,
    replyTo: email,
    subject: `New Contact Inquiry: ${subjectLabel}`,
    template: 'contact',
    data: {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subjectLabel,
      message: message.trim(),
    },
  });

  res.status(200).json({
    success: true,
    message: 'Your message has been sent successfully.',
    data: {
      mocked: mailResult.mocked,
    },
  });
});
