document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(data => {
      load_mailbox('inbox');
    })
    .catch(error => {
      console.log("Error: ", error);
    });

    return false;
  };

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(data => {
    if (data != ''){
      data.forEach(function(email){

        const div = document.createElement('div');
        const p_sender = document.createElement('p');
        const p_subject = document.createElement('p');
        const p_timestamp = document.createElement('p');

        p_sender.innerHTML = "From: " + email.sender;
        p_subject.innerHTML = "Subject: " + email.subject;
        p_timestamp.innerHTML = email.timestamp;
        

        div.append(p_sender);
        div.append(p_subject);
        div.append(p_timestamp);

        div.style.borderTop = '1px solid #d3d3d3';

        if (email.read === true){
          div.style.backgroundColor = '#E5E5E5';
        }
        else{
          div.style.backgroundColor = 'white';
        }

        div.style.cursor = "pointer";
        div.addEventListener('click', () => {

          view_email(email.id, mailbox);
        });

        document.querySelector('#emails-view').append(div);

      });
    }
    else{
      console.log(`Your ${mailbox} is currently empty.`);
    }
  })

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  function view_email(email_id, mailbox){
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Reset Old Email to not acummulate
    document.querySelector('#email-view').innerHTML = '';

    // Change email read to true
    fetch('emails/' + email_id, {
      method: 'PUT',
      body: JSON.stringify({
        read: true,
      })
    });

    // Get email data
    fetch('emails/' + email_id)
    .then(response => response.json())
    .then(data => {
      const div = document.createElement('div');
      const p_sender = document.createElement('p');
      const p_recipients = document.createElement('p');
      const p_subject = document.createElement('p');
      const p_body = document.createElement('p');
      const p_timestamp = document.createElement('p');
      const archive_btn = document.createElement('button');

      p_sender.innerHTML = "<strong>From:</strong> " + data.sender;
      p_recipients.innerHTML = "<strong>To:</strong> " + data.recipients;
      p_subject.innerHTML = "<strong>Subject:</strong> " + data.subject;
      p_body.innerHTML = "<strong>Message:</strong> " + data.body;
      p_timestamp.innerHTML = data.timestamp;
      archive_btn.className = 'btn btn-primary';
      archive_btn.id = 'archive-btn';

      if (!data.archived){
        archive_btn.innerHTML = 'Archive';
      }
      else{
        archive_btn.innerHTML = 'Unarchive';
      }

      archive_btn.addEventListener('click', () => {
        if (archive_btn.innerHTML === 'Archive'){
          archive_btn.innerHTML = 'Unarchive';
          fetch('emails/' + email_id, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true,
            })
          });
        }
        else{
          archive_btn.innerHTML = 'Archive';
          fetch('emails/' + email_id, {
            method: 'PUT',
            body: JSON.stringify({
              archived: false,
            })
          });
        }
        load_mailbox('inbox');
      });

      div.append(p_sender);
      div.append(p_recipients);
      div.append(p_subject);
      div.append(p_body);
      div.append(p_timestamp);
      if (mailbox !== 'sent'){
        div.append(archive_btn);
      }

      document.querySelector('#email-view').append(div);

    });
  }
}