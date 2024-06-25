//  Ici on gère la création du client S3 et l'upload des images
import env from '#start/env'
// Importation des fonctions nécessaires pour créer un flux de lecture à partir d'un fichier
import { createReadStream } from 'node:fs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const region: string | undefined = env.get('AWS_REGION')
const accessKeyId: string | undefined = env.get('AWS_ACCESS_KEY_ID')
const secretAccessKey: string | undefined = env.get('AWS_SECRET_ACCESS_KEY')

// Initialisation du client S3
const s3Client = new S3Client({
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
  region: region || '',
})

/**
 * Upload d'image sur S3 et retourne l'URL de l'image
 * On documente les paramètre de la fonction uploadImageToS3 (le type)
 * @param {string} filePath - Le chemin du fichier à uploader
 * @param {string} bucketName - Le nom du bucket
 * @param {string} key - Le nom sous lequel sauvegarder l'image
 * @returns {Promise<string>} - L'URL de l'image sur S3
 */

async function uploadImageToS3(filePath: string, bucketName: string, key: string): Promise<string> {
  // Création d'un flux de lecture à partir du fichier spécifié par filePath
  const fileStream = createReadStream(filePath)

  // Création de la commande PutObject pour uploader l'image sur S3
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileStream,
    //ACL: 'public-read', // rend l'image publiquement accessible
  })
  try {
    // Envoi de la commande au client S3
    await s3Client.send(command)
  } catch (error) {
    console.error('Error uploading image to S3:', error)
    throw new Error('Error uploading image to S3.')
    //return `Error uploading image to S3: ${error.message}`
  }

  // On return l'url de l'image ploadée sur S3
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`
}

export { uploadImageToS3 }
