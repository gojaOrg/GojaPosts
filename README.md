# GojaPosts

## Installation
To install and run the GojaPosts backend follow these instructions:

1. Clone the repository using a terminal of choice.
```
git clone git@github.com:ralfkatt/GojaPosts.git
```

2. Navigate the the backend folder.
```
cd GojaPosts/backend
```

3. Create a .env file contaning required information.
```
echo -e "MONGODB_USER=goja\nMONGODB_PASS=goja123\nMY_KEY=ghlw923njsdhj273ndkdhg91allkowebnk2\nS3_ACCESS_KEY=AKIA5HJ4KQJTQMZ27B4H\nS3_ACCESS_SECRET=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" > .env
```

4. Install packages.
```
npm install
```

5. Run GojaApi.
```
npm run dev
```
