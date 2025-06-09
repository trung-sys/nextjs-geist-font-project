"use client"

import { useState } from "react"
import "./animations.css"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Cloud, Upload } from "lucide-react"
import { MouseTrail } from "@/components/mouse-trail"

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [copySuccess, setCopySuccess] = useState<number | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [uploadType, setUploadType] = useState<"file" | "url">("file")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    // Validate each file
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError("Chỉ hỗ trợ file ảnh và video")
        return
      }
      if (file.type.startsWith("video/") && file.size > 15 * 1024 * 1024) {
        setError("Video phải nhỏ hơn 15MB")
        return
      }
      if (file.type.startsWith("image/") && file.size > 5 * 1024 * 1024) {
        setError("Ảnh phải nhỏ hơn 5MB")
        return
      }
    }

    setFiles(selectedFiles)
    setError("")
    
    if (selectedFiles.length > 0) {
      const previewUrl = URL.createObjectURL(selectedFiles[0])
      setPreview(previewUrl)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = e.dataTransfer.files
    
    if (!droppedFiles) return
    
    // Validate each file
    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i]
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError("Chỉ hỗ trợ file ảnh và video")
        return
      }
      if (file.type.startsWith("video/") && file.size > 15 * 1024 * 1024) {
        setError("Video phải nhỏ hơn 15MB")
        return
      }
      if (file.type.startsWith("image/") && file.size > 5 * 1024 * 1024) {
        setError("Ảnh phải nhỏ hơn 5MB")
        return
      }
    }

    setFiles(droppedFiles)
    setError("")
    setIsDragging(false)
    
    if (droppedFiles.length > 0) {
      const previewUrl = URL.createObjectURL(droppedFiles[0])
      setPreview(previewUrl)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleUrlUpload = async () => {
    if (!urlInput) {
      setError("Vui lòng nhập URL")
      return
    }

    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("url", urlInput)

      const response = await fetch("/api/upload-url", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Upload failed")
      }

      setImageUrls([...imageUrls, data.url])
      setUrlInput("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setError("Vui lòng chọn file")
      return
    }

    setLoading(true)
    setError("")
    const urls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData()
      formData.append("file", files[i])

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Upload failed")
        }

        urls.push(data.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
        setLoading(false)
        return
      }
    }

    setImageUrls(urls)
    setLoading(false)
  }

  const copyToClipboard = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(index)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      setError("Failed to copy to clipboard")
    }
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
      <MouseTrail />
      {/* Header */}
      <nav className="flex items-center justify-between p-4 px-8 text-white border-b border-[#1E90FF]">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 interactive-hover">
            <Cloud className="h-6 w-6 float-animation text-[#00FF85]" />
            <span className="text-xl font-bold tracking-tight neon-text">wepener.org</span>
          </div>
        </div>
        <div className="flex space-x-6">
          <button 
            onClick={() => window.open('https://chungchi24h.com/', '_blank')}
            className="nav-button text-white hover:shadow-lg"
          >
            Mua chứng chỉ iOS
          </button>
          <button className="nav-button text-white hover:shadow-lg">
            Về chúng tôi
          </button>
          <button 
            onClick={() => window.open('https://t.me/shuxorinn', '_blank')}
            className="nav-button text-white hover:shadow-lg"
          >
            Liên hệ
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-[#00FF85] neon-text">Up Ảnh Lấy Link</h1>
          <p className="text-xl font-semibold text-white">
            Dịch vụ lưu trữ ảnh trực tuyến siêu nhanh, đơn giản và an toàn. Upload ảnh miễn phí và nhận link trực tiếp chỉ trong vài giây với wepener.org.
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          <Button
            variant="outline"
            className={`nav-button text-white hover:shadow-lg ${
              uploadType === "file" ? "bg-[#0D0D0D] border-[#1E90FF]" : "bg-[#0D0D0D] border-transparent"
            }`}
            onClick={() => setUploadType("file")}
          >
            Upload từ máy
          </Button>
          <Button
            variant="outline"
            className={`nav-button text-white hover:shadow-lg ${
              uploadType === "url" ? "bg-[#0D0D0D] border-[#1E90FF]" : "bg-[#0D0D0D] border-transparent"
            }`}
            onClick={() => setUploadType("url")}
          >
            Upload từ URL
          </Button>
        </div>

        <Card className="p-6 bg-[#0D0D0D] border-[#1E90FF] neon-border animate-fade-in hover-scale">
          {uploadType === "file" ? (
            <div
              className={`border-2 border-dashed border-[#1E90FF] rounded-lg p-10 text-center mb-6 cursor-pointer hover:border-[#00FF85] transition-all duration-300 ${
                isDragging ? 'drop-zone-active' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
                multiple
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="space-y-4">
                  <Upload className={`h-12 w-12 mx-auto text-[#00FF85] ${isDragging ? 'icon-bounce' : 'float-animation'}`} />
                  <p className="text-white">Kéo thả ảnh hoặc video vào đây</p>
                  <div className="text-sm text-[#1E90FF] space-y-1">
                  <p className="text-lg font-semibold text-[#1E90FF]">• Ảnh hỗ trợ: JPG, PNG, GIF, WebP (tối đa 5MB)</p>
                  <p className="text-lg font-semibold text-[#1E90FF]">• Video hỗ trợ: MP4, WebM (tối đa 15MB)</p>
                </div>
                <p className="text-base font-semibold text-[#1E90FF]">hoặc</p>
                <Button
                  variant="secondary"
                  className="bg-[#1E90FF] text-white hover:bg-[#FF0099] border-0 font-semibold px-6 transition-all duration-300 hover:scale-105 hover-brightness interactive-hover"
                >
                  Chọn file từ máy tính
                </Button>
              </div>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  type="url"
                  placeholder="Dán link ảnh hoặc video vào đây..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-[#0D0D0D] text-white border-[#1E90FF] focus:border-[#00FF85] focus:ring-[#00FF85] font-semibold"
                />
                <Button
                  onClick={handleUrlUpload}
                  disabled={loading || !urlInput}
                  className="bg-[#1E90FF] text-white hover:bg-[#FF0099] font-semibold transition-all duration-300 hover:scale-[1.02] hover-brightness interactive-hover"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    "Tải lên"
                  )}
                </Button>
              </div>
              <p className="text-lg font-semibold text-[#1E90FF]">
                Hỗ trợ link trực tiếp đến file ảnh (JPG, PNG, GIF, WebP) hoặc video (MP4, WebM)
              </p>
            </div>
          )}

          {uploadType === "file" && (
            <Button
              onClick={handleUpload}
              disabled={!files || loading}
              className="w-full bg-[#1E90FF] text-white hover:bg-[#FF0099] font-medium transition-all duration-300 hover:scale-[1.02] hover-brightness interactive-hover"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                "Bắt đầu tải lên"
              )}
            </Button>
          )}

              {error && (
                <Alert variant="destructive" className="mt-4 bg-[#0D0D0D] text-[#FF0099] border-[#FF0099] neon-border font-semibold">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

          {imageUrls.length > 0 && (
            <div className="mt-6 space-y-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="bg-[#0D0D0D] border border-[#1E90FF] p-4 rounded-lg animate-slide-in link-appear neon-border" style={{ animationDelay: `${index * 100}ms` }}>
                  <p className="text-white break-all mb-2 font-semibold">{url}</p>
                  <Button 
                    onClick={() => copyToClipboard(url, index)}
                    variant="outline" 
                    className="w-full border-[#1E90FF] text-white hover:bg-[#FF0099] hover:text-[#0D0D0D] transition-all duration-300 hover:scale-[1.02] copy-button interactive-hover font-semibold"
                  >
                    {copySuccess === index ? "Đã sao chép!" : "Sao chép link"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
