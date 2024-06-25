import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import UserStatus from '../enums/user.js'

// Définir les noms des champs pour les messages d'erreur
const fields = {
  firstname: "Nom d'utilisateur",
  lastname: "Nom d'utilisateur",
  email: 'Email',
  password: 'Mot de passe',
  phoneNumber: 'Numéro de téléphone',
  age: 'Âge',
  biography: 'Biographie',
  location: 'Localisation',
  availability: 'Disponibilité',
  status: 'Statut',
  profilImage: 'Image de profil',
}

// Définir les messages de validation en français
const messagesProvider = new SimpleMessagesProvider(
  {
    // Messages globaux pour tous les champs
    'required': 'Merci de renseigner votre {{ field }}.',
    'string': 'Votre {{ field }} doit être une chaîne de caractères.',
    'email': 'Vous devez renseigner une adresse email valide.',
    'minLength': 'Votre {{ field }} doit avoir au moins 8 caractères.',
    'maxLength': 'Votre {{ field }} ne peut pas dépasser 32 caractères.',
    'alphaNumeric': 'Votre {{ field }} doit contenir uniquement des caractères alphanumériques.',
    'unique': 'Cet email est déjà associé à un autre compte.',
    'regex': "Votre {{ field }} n'a pas le format valide.",
    'enum': 'Votre {{ field }} doit être une des valeurs suivantes: {{ options.choices }}.',
    'file': {
      extnames: 'Votre {{ field }} doit être un fichier de type: {{ options.extnames }}.',
      size: 'Votre {{ field }} ne doit pas dépasser la taille de {{ options.size }}.',
    },
    'number': 'Votre {{ field }} doit être un nombre.',

    // Messages spécifiques aux champs
    'lastname.required': 'Votre nom est obligatoire.',
    'firstname.required': 'Votre prénom est obligatoire.',
    'email.required': 'Votre email est obligatoire.',
    'email.unique': 'Cet email est déjà associé à un autre compte.',
    'password.required': 'Votre mot de passe est obligatoire.',
    'password.minlenght': 'Votre mot de passe doit contenir au moins 8 caractères',
    'phoneNumber.required': 'Votre numéro de téléphone est obligatoire.',
    'location.required': 'Vous devez renseigner votre localisation.',
    'status.required': 'Vous devez renseigner le statut de votre compte.',
    'profilImage.file': 'Seule les images de type jpg et png sont acceptées.',
  },
  fields
)

// On valide les données fournies par le formulaire d'inscription
const registerSchema = vine.object({
  lastname: vine.string().escape().trim().minLength(3).alphaNumeric(),
  firstname: vine.string().escape().trim().minLength(3).alphaNumeric(),
  email: vine
    .string()
    .email()
    .unique(async (db, value) => {
      const users = await db.from('users').where('email', value).first()
      return !users
    }),
  password: vine.string().minLength(8),
  phoneNumber: vine
    .string()
    .alphaNumeric()
    .regex(/^(06|07)[0-9]{8}$/)
    .optional(),
  birthdate: vine.date().optional(),
  biography: vine.string().escape().trim().optional(),
  location: vine.string().trim().escape(),
  latitude: vine.number().min(-90).max(90),
  longitude: vine.number().min(-180).max(180),
  availability: vine.string().escape().optional(),
  status: vine
    .enum([UserStatus.AVEUGLE, UserStatus.MALVOYANT, UserStatus.VALIDE, UserStatus.PARENT])
    .optional(),
  profilImage: vine.file({ extnames: ['jpg', 'png'], size: '10mb' }).optional(),
})

const loginSchema = vine.object({
  email: vine.string().email(),
  password: vine.string().minLength(8),
})

const updateSchema = vine.object({
  firstname: vine.string().escape().trim().minLength(3).alphaNumeric().optional(),
  lastname: vine.string().escape().trim().minLength(3).alphaNumeric().optional(),
  age: vine.number().withoutDecimals().optional(),
  birthdate: vine.date().optional(),
  location: vine.string().trim().escape().optional(),
  availability: vine.string().escape().optional(),
  status: vine
    .enum([UserStatus.AVEUGLE, UserStatus.MALVOYANT, UserStatus.VALIDE, UserStatus.PARENT])
    .optional(),
  profilImage: vine.file({ extnames: ['jpg', 'png'], size: '10mb' }).optional(),
  phoneNumber: vine
    .string()
    .alphaNumeric()
    .regex(/^(06|07)[0-9]{8}$/)
    .optional(),
})

// Compiler les schémas avec les messages de validation
export const registerUserValidator = vine.compile(registerSchema)
registerUserValidator.messagesProvider = messagesProvider

export const loginUserValidator = vine.compile(loginSchema)
loginUserValidator.messagesProvider = messagesProvider

export const updateUserValidator = vine.compile(updateSchema)
updateUserValidator.messagesProvider = messagesProvider
