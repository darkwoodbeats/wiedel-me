import Foundation
import PDFKit
import AppKit
let a = CommandLine.arguments
let url = URL(fileURLWithPath: a[1]); let outDir = a[2]
let scale = CGFloat(Double(a.count > 3 ? a[3] : "1.3")!)
guard let doc = PDFDocument(url: url) else { print("no pdf"); exit(1) }
for i in 0..<doc.pageCount {
  let page = doc.page(at: i)!
  let b = page.bounds(for: .mediaBox)
  let size = NSSize(width: b.width*scale, height: b.height*scale)
  let img = NSImage(size: size)
  img.lockFocus()
  NSColor.white.setFill(); NSRect(origin: .zero, size: size).fill()
  let ctx = NSGraphicsContext.current!.cgContext
  ctx.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: ctx)
  img.unlockFocus()
  let rep = NSBitmapImageRep(data: img.tiffRepresentation!)!
  let png = rep.representation(using: .png, properties: [:])!
  try! png.write(to: URL(fileURLWithPath: String(format: "%@/page-%02d.png", outDir, i+1)))
}
print(doc.pageCount)
