# Emails

## Fonctionnalité

CAMAP envoie beaucoup d'emails : notifications, confirmation de création de souscription, changement de mot de passe, alertes, emails de la messagerie ...etc

## BDD

CAMAP gère une pile d'email à envoyer via un service SMTP.
Pour envoyer un email il suffit donc d'écrire dans cette pile pour stocker le mail à envoyer. Ensuite un cron se charge de l'envoyer régulièrement et de vider la pile.

Cette pile est stockée dans la table `BufferedJsonEmail`.

## Code

### Création d'un mail en Haxe

Le langage de template utilisé est le même que pour les pages servies en Haxe : [Templo](https://github.com/ncannasse/templo) ( fichiers \*.mtt )

Exemple pour envoyer un email simple :

```
App.quickMail( email, title, message, group );
```

Exemple pour un email plus complexe avec template dédié :

```
var m = new Mail();
m.setSender(senderEmail,senderName);
m.addRecipient(user.email, user.getName());
m.setSubject( t._("Distribution on ::date::",{date:app.view.hDate(md.distribStartDate)})  );
m.setHtmlBody( app.processTemplate("mail/orderNotif.mtt", {
	text:text,
	group:group,
	multiDistrib:md,
	hHour:Formatting.hHour
} ) );
// does not send the mail, store it in BufferedJsonEmail table
App.sendMail(m , group);
```

### Création d'un mail en TS

Le langage de template utilisé est [TWIG](https://twig.symfony.com/) avec la librairie [twing](https://www.npmjs.com/package/twing)

Exemple de code.

```
const mail = await this.mailsService.createBufferedJsonMail(
      'message.twig',
      {
        text: htmlBody,
        quitGroupLink: this.mailsService.getQuitGroupLink(group.id),
        groupName: group.name,
        groupId: group.id,
        list: list?.name,
      },
      title,
      recipients,
      {
        firstName: senderName,
        lastName: '',
        email: senderEmail,
        id: currentUser.id,
      },
      true,
      attachments,
    );
```

### Cron d'envoi des mails en TS

Le cron qui envoie réellement les emails via SMTP est dans `MailsService.sendEmailsFromBuffer()`

## Developement

En développement local le service mailpit tourne depuis docker et capture tout le traffic mail,
les emails envoyés sont visibles depuis l'interface mailpit sur http://localhost:8025