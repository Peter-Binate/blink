import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const fields = {
  name: 'Name',
  email: 'Email',
  password: 'Password',
}

const messagesProvider = new SimpleMessagesProvider(
  {
    // Applicable for all fields
    'required': 'The {{ field }} field is required',
    'string': 'The value of {{ field }} field must be a string',
    'email': 'The value is not a valid email address',

    // Error message for the custom fields
    'name.required': 'Please enter name',
    'email.required': 'Please enter email',
    'password.required': 'Please enter password',
  },
  fields
)

const schema = vine.object({
  name: vine.string(),
  email: vine.string().email(),
  password: vine.string().minLength(6),
})

const validator = vine.compile(schema)
validator.messagesProvider = messagesProvider
