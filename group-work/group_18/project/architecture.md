## Coleção: users
```json
{
  "_id": "ObjectId()",
  "username": "miguel",
  "name": "Miguel Silva",
  "email": "miguel@example.com",
  "bio": "Olá!",
  "createdAt": "ISODate()",
  "followersCount": 120,
  "followingCount": 80
}
```

## Coleção: posts
```json
{
  "_id": "ObjectId()",
  "userId": "ObjectId()",
  "caption": "Dia incrível!",
  "imageUrl": "https://...",
  "hashtags": ["#sunset", "#porto"],
  "likes": 52,
  "createdAt": "ISODate()"
}

```

## Coleção: comments
```json
{
  "_id": "ObjectId()",
  "postId": "ObjectId()",
  "userId": "ObjectId()",
  "text": "Muito bom!",
  "createdAt": "ISODate()"
}

```

## Coleção: follows
```json
{
  "_id": "ObjectId()",
  "userId": "ObjectId()",      //quem segue
  "targetId": "ObjectId()",    //quem é seguido
  "createdAt": "ISODate()"
}
```

## Coleção: messages
```json
{
  "_id": "ObjectId()",
  "senderId": "ObjectId()",
  "receiverId": "ObjectId()",
  "body": "Olá!",
  "createdAt": "ISODate()",
  "status": "sent"
}
```
