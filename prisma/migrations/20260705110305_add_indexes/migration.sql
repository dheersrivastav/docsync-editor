-- CreateIndex
CREATE INDEX "Document_ownerId_idx" ON "Document"("ownerId");

-- CreateIndex
CREATE INDEX "DocumentCollaborator_userId_idx" ON "DocumentCollaborator"("userId");

-- CreateIndex
CREATE INDEX "DocumentVersion_documentId_serverClock_idx" ON "DocumentVersion"("documentId", "serverClock");
