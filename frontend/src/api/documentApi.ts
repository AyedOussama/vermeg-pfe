import apiClient from './apiClient';

// Types pour les documents
interface DocumentUploadResponse {
  id: number;
  filename: string;
  originalFilename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  keycloakId: string;
}

interface DocumentMetadata {
  id: number;
  filename: string;
  originalFilename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  keycloakId: string;
}

// API des documents
const documentApi = {
  // Upload d'un CV - POST /documents/upload
  uploadCV: async (file: File, keycloakId: string): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('keycloakId', keycloakId);

    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload d'un document générique - POST /documents/upload
  uploadDocument: async (file: File, keycloakId: string, documentType?: string): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('keycloakId', keycloakId);
    if (documentType) {
      formData.append('documentType', documentType);
    }

    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Télécharger un document - GET /documents/{id}/download
  downloadDocument: async (documentId: number): Promise<Blob> => {
    const response = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Obtenir les métadonnées d'un document - GET /documents/{id}
  getDocumentMetadata: async (documentId: number): Promise<DocumentMetadata> => {
    const response = await apiClient.get(`/documents/${documentId}`);
    return response.data;
  },

  // Obtenir tous les documents d'un utilisateur - GET /documents/user/{keycloakId}
  getUserDocuments: async (keycloakId: string): Promise<DocumentMetadata[]> => {
    const response = await apiClient.get(`/documents/user/${keycloakId}`);
    return response.data;
  },

  // Supprimer un document - DELETE /documents/{id}
  deleteDocument: async (documentId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  },

  // Remplacer un document - PUT /documents/{id}/replace
  replaceDocument: async (documentId: number, file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.put(`/documents/${documentId}/replace`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obtenir l'URL de prévisualisation d'un document - GET /documents/{id}/preview
  getDocumentPreviewUrl: (documentId: number): string => {
    return `${apiClient.defaults.baseURL}/documents/${documentId}/preview`;
  },

  // Créer un lien de téléchargement temporaire
  createDownloadLink: (documentId: number, filename: string): void => {
    const url = `${apiClient.defaults.baseURL}/documents/${documentId}/download`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default documentApi;
export type { DocumentUploadResponse, DocumentMetadata };
