from jinja2 import Template
import os
import sendgrid

def compile_stats():
    # pull last-week snapshots from Pinecone
    # compute avg WPM, most-liked activities, mood trend
    ...

def send_email(report_html: str):
    sg = sendgrid.SendGridAPIClient(os.environ["SENDGRID_KEY"])
    sg.send({
        "from": {"email": "coach@learninggpt.app"},
        "personalizations": [{
            "to": [{"email": "dad@example.com"}],
            "subject": "Karl’s Learning Adventure – Weekly Recap"
        }],
        "content": [{"type": "text/html", "value": report_html}]
    })

if __name__ == "__main__":
    stats = compile_stats()
    html = Template(open("templates/weekly.html").read()).render(**stats)
    send_email(html)
