export const randomPick = (max: number) => {
  if (max <= 0) {
    return 0
  }
  return Math.floor(Math.random() * max)
}
