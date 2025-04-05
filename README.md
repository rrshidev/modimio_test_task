# modimio_test_task
test task for modimio company on backend developer vacancy


start project: npm install
start migrations: npx prisma migrate dev --name init
start server: npx ts-node src/index.ts

checking:
# Регистрация пользователя
mutation {
  register(login: "test", email: "test@mail.com", password: "123456") {
    token
    user {
      id
      email
    }
  }
}

# Вход пользователя
mutation {
  login(email: "test@mail.com", password: "123456") {
    token
    user {
      id
      email
    }
  }
}

# Личный кабинет
query {
  me {
    id
    login
    email
  }
}