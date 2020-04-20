Making your first PR
==============================

### 1. **Fork**
Click the fork button.

![image](https://user-images.githubusercontent.com/5455859/79698757-d5d0c180-823f-11ea-86e7-8edcd1b969be.png)

### 2. **Environment Setup**
Clone your fork and set up your environment for development. I reccommend [iterm](https://www.iterm2.com/), but use whatever you'd like.

**In terminal window 1**
```sh
git clone git@github.com:YOUR_USERNAME/use-http.git
cd ./use-http
yarn
yarn link
```
**In terminal window 2** (your react app to test `use-http` in)
```sh
create-react-app use-http-sandbox
cd ./use-http-sandbox
yarn
yarn link use-http
```
**In terminal window 1** (inside your forked `use-http` directory)
```sh
npm link ../use-http-sandbox/node_modules/react
npm link ../use-http-sandbox/node_modules/react-dom
yarn build:watch
```
**In terminal window 2** (your react app to test `use-http` in)
```sh
yarn start
```

### 3. **Develop**
Now just go into your `use-http-sandbox/src/App.js` and import use-http and now you can develop. When you make changes in `use-http` it should cause `use-http-sandbox` to refresh `localhost:3000`.

### 4. **Test**
Once you're done making your changes be sure to make some tests and run all of them. What I do is open up 3 different panes in the same iTerm2 window by pressing `⌘ + D` on mac 2 times. In the far left I do `yarn build:watch`, in the middle I do `yarn test:browser:watch` (where you'll probably be writing your tests) and in the 3rd window I do `yarn test:server:watch`. It looks like this.
![image](https://user-images.githubusercontent.com/5455859/79790558-bf3e6f00-8300-11ea-89ad-241ce943f1b3.png)

### 4. **Push**
Push your changes to your forked repo.

### 5. **Make PR**
Once you push your changes, you will see a link in your terminal that looks like this.
```sh
remote: Create a pull request for 'master' on GitHub by visiting:
remote:      https://github.com/YOUR_USERNAME/use-http/pull/new/master
```
go to that url. From there you should be able to compare your forked master branch to `ava/use-http:master`.
