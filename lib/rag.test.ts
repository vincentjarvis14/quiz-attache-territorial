import { describe, it, expect } from "vitest"
import { buildOrTsQuery } from "./rag"

// buildOrTsQuery transforme une requête en langage naturel en tsquery OR pour le
// niveau "rappel" de la recherche BM25. Fonction pure, sans accès base.
describe("buildOrTsQuery", () => {
  it("relie les termes par un OU (|) pour le rappel", () => {
    expect(buildOrTsQuery("plan local urbanisme PLU")).toBe("plan | local | urbanisme | plu")
  })

  it("met la requête en minuscules", () => {
    expect(buildOrTsQuery("PLAN Local")).toBe("plan | local")
  })

  it("ignore les mots de moins de 3 caractères", () => {
    expect(buildOrTsQuery("le PLU du sol")).toBe("plu | sol")
  })

  it("remplace la ponctuation par des séparateurs", () => {
    expect(buildOrTsQuery("L151-1, alinéa")).toBe("l151 | alinéa")
  })

  it("préserve les lettres accentuées", () => {
    expect(buildOrTsQuery("aménagement déclaration")).toBe("aménagement | déclaration")
  })

  it("retourne une chaîne vide si aucun terme ne qualifie", () => {
    expect(buildOrTsQuery("a b c")).toBe("")
    expect(buildOrTsQuery("")).toBe("")
  })
})
