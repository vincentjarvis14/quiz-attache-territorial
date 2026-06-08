import { describe, it, expect } from "vitest"
import {
  nextBox,
  computeDueAt,
  reviewCard,
  isSousThemeDecayed,
  startOfDay,
  addDays,
  BOX_INTERVALS_DAYS,
  MAX_BOX,
} from "./srs"

// Helpers — dates construites en heure locale (mois 1-indexé ici pour la lisibilité).
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h, 0, 0, 0)
const EXAM = at(2026, 9, 15) // concours lointain : le plafond examen n'interfère pas
const NOW = at(2026, 6, 8, 10) // 8 juin 2026, 10h

describe("startOfDay / addDays", () => {
  it("startOfDay remet l'heure à minuit", () => {
    const z = startOfDay(NOW)
    expect(z.getHours()).toBe(0)
    expect(z.getMinutes()).toBe(0)
    expect(z.getDate()).toBe(8)
  })

  it("addDays décale du bon nombre de jours", () => {
    expect(addDays(NOW, 4).getDate()).toBe(12)
    expect(addDays(NOW, -1).getDate()).toBe(7)
  })
})

describe("nextBox", () => {
  it("monte d'une boîte si la réponse est correcte", () => {
    expect(nextBox(0, true)).toBe(1)
    expect(nextBox(2, true)).toBe(3)
  })

  it("plafonne à MAX_BOX (6)", () => {
    expect(nextBox(MAX_BOX, true)).toBe(MAX_BOX)
    expect(nextBox(MAX_BOX, true)).toBe(6)
  })

  it("retombe en boîte 0 si la réponse est fausse, quelle que soit la boîte", () => {
    expect(nextBox(0, false)).toBe(0)
    expect(nextBox(4, false)).toBe(0)
    expect(nextBox(MAX_BOX, false)).toBe(0)
  })
})

describe("computeDueAt", () => {
  it("boîte 0 = à revoir aujourd'hui (intervalle 0 jour)", () => {
    expect(computeDueAt(0, NOW, null).getTime()).toBe(startOfDay(NOW).getTime())
  })

  it("applique l'intervalle de la boîte, normalisé à minuit", () => {
    // boîte 3 → +4 jours (cf. BOX_INTERVALS_DAYS)
    const expected = startOfDay(addDays(NOW, BOX_INTERVALS_DAYS[3]))
    expect(computeDueAt(3, NOW, EXAM).getTime()).toBe(expected.getTime())
    expect(computeDueAt(3, NOW, EXAM).getDate()).toBe(12) // 8 + 4
  })

  it("plafonne au plus tard à la veille du concours", () => {
    const examProche = addDays(NOW, 2) // concours dans 2 jours
    // boîte 6 voudrait +30 jours, mais doit être ramenée à la veille (J+1)
    const due = computeDueAt(MAX_BOX, NOW, examProche)
    expect(due.getTime()).toBe(startOfDay(addDays(examProche, -1)).getTime())
  })

  it("ne renvoie jamais une date antérieure à aujourd'hui (concours passé)", () => {
    const examPasse = addDays(NOW, -5)
    expect(computeDueAt(3, NOW, examPasse).getTime()).toBe(startOfDay(NOW).getTime())
  })

  it("borne l'index de boîte hors plage", () => {
    // box 99 → traité comme MAX_BOX (intervalle 30 j)
    const expected = startOfDay(addDays(NOW, BOX_INTERVALS_DAYS[MAX_BOX]))
    expect(computeDueAt(99, NOW, null).getTime()).toBe(expected.getTime())
  })
})

describe("reviewCard", () => {
  it("carte neuve + bonne réponse → boîte 1, 0 oubli, due demain", () => {
    const next = reviewCard(null, true, NOW, EXAM)
    expect(next.box).toBe(1)
    expect(next.lapses).toBe(0)
    expect(next.dueAt.getTime()).toBe(startOfDay(addDays(NOW, 1)).getTime())
  })

  it("carte neuve + mauvaise réponse → boîte 0, 1 oubli, due aujourd'hui", () => {
    const next = reviewCard(null, false, NOW, EXAM)
    expect(next.box).toBe(0)
    expect(next.lapses).toBe(1)
    expect(next.dueAt.getTime()).toBe(startOfDay(NOW).getTime())
  })

  it("réponse correcte : monte d'une boîte, conserve le compteur d'oublis", () => {
    const next = reviewCard({ box: 2, lapses: 1 }, true, NOW, EXAM)
    expect(next.box).toBe(3)
    expect(next.lapses).toBe(1)
  })

  it("réponse fausse : remet à zéro la boîte et incrémente les oublis", () => {
    const next = reviewCard({ box: 4, lapses: 1 }, false, NOW, EXAM)
    expect(next.box).toBe(0)
    expect(next.lapses).toBe(2)
  })
})

describe("isSousThemeDecayed", () => {
  it("trop de cartes en retard → le sous-thème repasse à revoir", () => {
    expect(isSousThemeDecayed(3, NOW, NOW)).toBe(true)
  })

  it("pas révisé depuis 14 jours → repasse à revoir", () => {
    expect(isSousThemeDecayed(0, addDays(NOW, -14), NOW)).toBe(true)
  })

  it("révision récente et peu de retard → reste maîtrisé", () => {
    expect(isSousThemeDecayed(1, addDays(NOW, -2), NOW)).toBe(false)
  })

  it("jamais révisé (null) et aucun retard → reste maîtrisé", () => {
    expect(isSousThemeDecayed(0, null, NOW)).toBe(false)
  })
})
