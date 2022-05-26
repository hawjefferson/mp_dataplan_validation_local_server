# docker build -t mptestserver .
# docker run -p 3000:3000 mptestserver

FROM node:18
WORKDIR /usr/src/app
COPY . .

RUN npm install
ENV PATH="${PATH}:node_modules/.bin"

EXPOSE 3000
CMD ["node", "app.js"]