export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.warn('Lead tracking data received:', body)

    return Response.json({
      success: true,
      message: 'Lead tracked successfully',
    })
  } catch (error) {
    console.error('Error processing lead:', error)
    return Response.json(
      { success: false, error: 'Failed to process lead' },
      { status: 500 }
    )
  }
}
