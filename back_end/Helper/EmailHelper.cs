using ESCE_SYSTEM.Options;
using Microsoft.Extensions.Options;
using MailKit.Net.Smtp;
using MimeKit;
using ESCE_SYSTEM.Options;

namespace ESCE_SYSTEM.Helper;

public class EmailHelper
{
    private readonly SmtpSetting _smtpSetting;

    public EmailHelper(IOptions<SmtpSetting> smtpSetting)
    {
        _smtpSetting = smtpSetting.Value;
    }

    public async Task SendEmailAsync(string subject, string content, List<string> toEmails, bool isHtmlContent = false, List<string> ccEmails = null)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_smtpSetting.AppName, _smtpSetting.FromEmail));
        foreach (var email in toEmails)
        {
            message.To.Add(new MailboxAddress("", email));
        }
        if (ccEmails != null && ccEmails.Count > 0)
        {
            foreach (var cc in ccEmails)
            {
                message.Cc.Add(new MailboxAddress("", cc));
            }
        }
        message.Subject = subject;

        if (isHtmlContent)
        {
            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = content
            };
            message.Body = bodyBuilder.ToMessageBody();
        }
        else
        {
            message.Body = new TextPart("plain")
            {
                Text = content
            };
        }



        using var client = new SmtpClient();
        await client.ConnectAsync(_smtpSetting.SmtpServer, _smtpSetting.Port, MailKit.Security.SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_smtpSetting.FromEmail, _smtpSetting.Password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
