document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  //document.querySelector('#emails-view').children.forEach(function(teste){
   // this.addEventListener('click', () => {
     // console.log("funcionou")
    //})
  //});

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
      console.log(data);
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
        let div = document.createElement('div');
        let p_sender = document.createElement('p');
        let p_subject = document.createElement('p');
        let p_timestamp = document.createElement('p');

        console.log(email);
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

        document.querySelector('#emails-view').append(div);

      });
    }
    else{
      console.log(`Your ${mailbox} is currently empty.`);
    }
  })

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}