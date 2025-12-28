import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log("Transcription API called")

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const language = formData.get('language') as string || 'auto'  // Get language hint

    if (!audioFile) {
      console.log("No audio file provided")
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ASSEMBLYAI_API_KEY || process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY

    if (!apiKey) {
      console.log("AssemblyAI API key is not configured")
      return NextResponse.json(
        { error: 'AssemblyAI API key is not configured' },
        { status: 500 }
      )
    }

    console.log("Uploading audio to AssemblyAI...")


    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': apiKey
      },
      body: Buffer.from(await audioFile.arrayBuffer())
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.log("Upload error:", uploadResponse.status, errorText)
      return NextResponse.json(
        { error: `Error uploading audio: ${uploadResponse.status}` },
        { status: 500 }
      )
    }

    const uploadData = await uploadResponse.json()
    const upload_url = uploadData.upload_url

    if (!upload_url) {
      console.log("No upload URL returned:", uploadData)
      return NextResponse.json(
        { error: 'No upload URL returned from AssemblyAI' },
        { status: 500 }
      )
    }

    console.log("Audio uploaded successfully, requesting transcription...")

    // Build transcription config based on language
    const transcriptionConfig: any = {
      audio_url: upload_url,
    };

    // If language is specified (fr or en), use it directly; otherwise enable auto-detection
    if (language === 'fr') {
      transcriptionConfig.language_code = 'fr';  // French
      console.log("Using French transcription");
    } else if (language === 'en') {
      transcriptionConfig.language_code = 'en';  // English
      console.log("Using English transcription");
    } else {
      transcriptionConfig.language_detection = true;  // Auto-detect
      console.log("Using automatic language detection");
    }

    // Request transcription with language configuration
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transcriptionConfig)
    })

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text()
      console.log("Transcription request error:", transcriptResponse.status, errorText)
      return NextResponse.json(
        { error: `Error requesting transcription: ${transcriptResponse.status}` },
        { status: 500 }
      )
    }

    const transcriptData = await transcriptResponse.json()
    const transcriptId = transcriptData.id

    if (!transcriptId) {
      console.log("No transcript ID returned:", transcriptData)
      return NextResponse.json(
        { error: 'No transcript ID returned from AssemblyAI' },
        { status: 500 }
      )
    }

    console.log("Transcription requested, polling for results...")


    let status = 'processing'
    let transcript = ''
    let attempts = 0
    const maxAttempts = 60 

    while ((status === 'processing' || status === 'queued') && attempts < maxAttempts) {
      attempts++

      
      await new Promise(resolve => setTimeout(resolve, 1000))


      const checkResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': apiKey
        }
      })

      if (!checkResponse.ok) {
        const errorText = await checkResponse.text()
        console.log("Check status error:", checkResponse.status, errorText)
        return NextResponse.json(
          { error: `Error checking transcription status: ${checkResponse.status}` },
          { status: 500 }
        )
      }

      const data = await checkResponse.json()
      status = data.status

      console.log(`Polling attempt ${attempts}: Status = ${status}`)

      if (status === 'completed') {
        transcript = data.text
        console.log("Transcription completed:", transcript)
      } else if (status === 'error') {
        console.log("Transcription error:", data.error)
        return NextResponse.json(
          { error: `Transcription error: ${data.error}` },
          { status: 500 }
        )
      }
    }

    if (attempts >= maxAttempts && (status === 'processing' || status === 'queued')) {
      console.log("Transcription timed out")
      return NextResponse.json(
        { error: 'Transcription timed out' },
        { status: 500 }
      )
    }

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('Error in transcription API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 