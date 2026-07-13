FROM node20.18.1
WORKDIR /auth-app
COPY package*.json ./
RUN npm install
COPY . .    
EXPOSE 3000 
CMD ["npx", "nodemon", "app.js"]