'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useQuote } from '@/context/QuoteContext'
import { StepContainer } from './StepContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Paintbrush, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Helper function to capitalize color names
const capitalizeColorName = (colorName: string) => {
  const colorMap: Record<string, string> = {
    black: 'Black',
    white: 'White',
    bronze: 'Bronze',
    anodized: 'Anodized',
  }
  return colorMap[colorName.toLowerCase()] || colorName
}
import type {
  ProductTypeInfo,
  RalColor,
  ProductId,
  SystemType,
  GlazingOption,
  HardwareFinish,
} from '@/lib/types'
import {
  PRODUCT_TYPES,
  TINT_OPTIONS,
  HARDWARE_FINISH_OPTIONS,
  FINISH_OPTIONS,
} from '@/lib/constants'
import { CheckCircle } from 'lucide-react'
import DoorConfigurator from '../DoorConfigurator'
import type { PaneCount, Tint } from '@/lib/types'
import { useScrollSpy } from '@/hooks/use-scroll-spy'

const CONFIG_SECTIONS = [
  { id: 'size', title: 'Size & Configuration' },
  { id: 'color', title: 'Color Selection' },
  { id: 'glass', title: 'Glass Options' },
  { id: 'hardware', title: 'Hardware Finish' },
  { id: 'summary-button', title: 'Next Step' },
]

// Section Wrapper
const ConfigSection = React.forwardRef<
  HTMLDivElement,
  {
    title: string
    children: React.ReactNode
    id: string
    sectionNumber: number
  }
>(({ title, children, id, sectionNumber }, ref) => (
  <div ref={ref} id={id} className="py-8 scroll-mt-24">
    <h2 className="text-2xl font-bold mb-2">
      {sectionNumber}. {title}
    </h2>
    <Separator className="mb-6" />
    {children}
  </div>
))
ConfigSection.displayName = 'ConfigSection'

// Product Type Selector
const ProductTypeSelector = () => {
  const { state, dispatch } = useQuote()
  const activeItem = state.items[state.activeItemIndex]

  const handleSelect = (product: ProductTypeInfo) => {
    dispatch({ type: 'SET_PRODUCT_TYPE', payload: product.id })

    setTimeout(() => {
      const nextSection = document.getElementById('size')
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
      {PRODUCT_TYPES.map((product) => {
        const [priceLabel, priceValue] = product.basePrice.split(':')
        return (
          <Card
            key={product.id}
            onClick={() => handleSelect(product)}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col overflow-hidden',
              activeItem.product.type === product.id
                ? 'border-primary ring-2 ring-primary'
                : 'border-border'
            )}
          >
            <div className="relative h-40 w-full p-4">
              <Image
                src={product.image.src}
                alt={product.image.alt}
                fill
                className="object-contain max-w-[90%] max-h-[90%] mx-auto"
                data-ai-hint={product.image.hint}
              />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center h-14">
                {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow p-6 pt-0">
              <p className="text-muted-foreground mb-4 text-sm flex-grow">
                {product.description}
              </p>
              <ul className="space-y-2 text-sm mb-4">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-2 w-2 mr-3 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">{priceLabel}:</p>
                <p className="text-xl font-semibold">{priceValue.trim()}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Size and Config Selector
const SizeAndConfigSelector = () => {
  const { state, dispatch } = useQuote()
  const activeItem = state.items[state.activeItemIndex]
  const { product, roomName: initialRoomName } = activeItem

  const [width, setWidth] = useState(product.widthIn || 0)
  const [height, setHeight] = useState(product.heightIn || 0)
  const [roomName, setRoomName] = useState(initialRoomName || '')

  const productInfo = useMemo(
    () => PRODUCT_TYPES.find((p) => p.id === product.type),
    [product.type]
  )
  // Note: productType, isAwningWindow and Multi-Slide are not currently in use
  // const productType = product.type as ProductId
  // const isAwningWindow = productType === 'Awning-Window'
  // const isMultiSlideFamily = productType === 'Multi-Slide'

  useEffect(() => {
    // Awning-Window configuration logic disabled (type not in system)
    // if (
    //   product.type === 'Awning-Window' &&
    //   product.configuration !== 'Top-hinge'
    // ) {
    //   dispatch({
    //     type: 'SET_CONFIGURATION',
    //     payload: { configuration: 'Top-hinge' },
    //   })
    // }
  }, [product.type, product.configuration, dispatch])

  const handleBlur = () => {
    dispatch({
      type: 'SET_PRODUCT_SIZE',
      payload: { widthIn: width, heightIn: height },
    })
    dispatch({ type: 'SET_ROOM_NAME', payload: roomName })
  }

  const handleSystemTypeChange = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_SYSTEM_TYPE', payload: value as SystemType })
    },
    [dispatch]
  )

  return (
    <div className="space-y-12">
      {isMultiSlideFamily && (
        <Card className="p-6 transition-shadow hover:shadow-lg">
          <h3 className="text-xl font-semibold">System Type *</h3>
          <RadioGroup
            value={product.systemType || 'Multi-Slide'}
            onValueChange={handleSystemTypeChange}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Label className="flex flex-col items-start space-x-2 rounded-md border p-4 cursor-pointer transition-colors hover:bg-accent has-[:checked]:bg-accent has-[:checked]:ring-2 has-[:checked]:ring-primary">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Multi-Slide" id="multi-slide" />
                <span>Sliders and Multi-Slide Systems</span>
              </div>
            </Label>
            <Label className="flex flex-col items-start space-x-2 rounded-md border p-4 cursor-pointer transition-colors hover:bg-accent has-[:checked]:bg-accent has-[:checked]:ring-2 has-[:checked]:ring-primary">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Pocket Door" id="pocket-door" />
                <span>
                  Pocket Door System{' '}
                  <span className="font-bold text-primary ml-1">
                    (Upcharge: $1,200)
                  </span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground pl-6 pt-1">
                Do not include the pocket area in width, this will be calculated
                by our system.
              </p>
            </Label>
          </RadioGroup>
        </Card>
      )}

      <Card className="p-6 transition-shadow hover:shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Dimensions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label htmlFor="width">Width (inches) *</Label>
            <Input
              id="width"
              type="number"
              placeholder="Enter width"
              value={width || ''}
              onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
              onBlur={handleBlur}
              step="0.25"
            />
            <p className="text-sm text-muted-foreground">
              Max width: {productInfo?.sizeConstraints.maxWidth}"
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (inches) *</Label>
            <Input
              id="height"
              type="number"
              placeholder="Enter height"
              value={height || ''}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              onBlur={handleBlur}
              step="0.25"
            />
            <p className="text-sm text-muted-foreground">
              Max height: {productInfo?.sizeConstraints.maxHeight}"
            </p>
          </div>
        </div>
      </Card>

      {!isAwningWindow && (
        <Card className="p-6 transition-shadow hover:shadow-lg">
          <DoorConfigurator
            widthIn={width}
            heightIn={height}
            systemType={
              activeItem.product.systemType === 'Pocket Door'
                ? 'pocket'
                : 'multi-slide'
            }
          />
        </Card>
      )}

      <div className="mt-8">
        <Label htmlFor="roomName">Room Name (Optional)</Label>
        <Input
          id="roomName"
          placeholder="e.g. Living Room, Master Bedroom"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          onBlur={handleBlur}
          className="mt-2"
        />
      </div>
    </div>
  )
}

// Color Selector
const ColorSelector = () => {
  const { state, dispatch } = useQuote()
  const activeItem = state.items[state.activeItemIndex]
  const { exterior, interior, isSame } = activeItem.colors

  const [editing, setEditing] = useState<'exterior' | 'interior' | null>(null)

  const handleSelectColor = (color: RalColor) => {
    if (!editing) return
    const actionType =
      editing === 'exterior' ? 'SET_EXTERIOR_COLOR' : 'SET_INTERIOR_COLOR'
    dispatch({ type: actionType, payload: color })
    setEditing(null)
  }

  const ColorSwatch = ({
    color,
    isSelected,
    onSelect,
  }: {
    color: RalColor
    isSelected: boolean
    onSelect: () => void
  }) => (
    <div
      onClick={onSelect}
      className="flex flex-col items-center gap-2 cursor-pointer group"
    >
      <div
        className={cn(
          'w-24 h-24 rounded-lg border-2 flex items-center justify-center transition-all',
          isSelected
            ? 'border-primary ring-2 ring-primary'
            : 'border-border hover:border-primary/50'
        )}
        style={{ backgroundColor: color.hex }}
      >
        {isSelected && (
          <CheckCircle
            className="h-8 w-8 text-white"
            style={{ mixBlendMode: 'difference' }}
          />
        )}
      </div>
      <p className="font-medium text-sm text-center">
        {capitalizeColorName(color.name)}
      </p>
    </div>
  )

  if (editing) {
    const currentSelection = editing === 'exterior' ? exterior : interior
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => setEditing(null)}
          className="mb-4"
        >
          Back to Item Configuration
        </Button>
        <h3 className="text-xl font-semibold mb-4 text-center capitalize">
          Select {editing} Finish
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-center">
          {FINISH_OPTIONS.map((color) => (
            <ColorSwatch
              key={color.name}
              color={color}
              isSelected={currentSelection?.name === color.name}
              onSelect={() => handleSelectColor(color)}
            />
          ))}
        </div>
      </div>
    )
  }

  const isColorSelected = (color?: RalColor) => !!color?.name

  const SelectedColorDisplay = ({
    color,
    onClick,
    label,
  }: {
    color: RalColor
    onClick: () => void
    label: string
  }) => (
    <div onClick={onClick} className="cursor-pointer group">
      <Label className="mb-2 block">{label}</Label>
      <div className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-slate-50">
        <div
          className="w-16 h-16 rounded-md border"
          style={{ backgroundColor: color.hex }}
        />
        <div className="flex-grow">
          <p className="font-semibold text-lg">
            {capitalizeColorName(color.name)}
          </p>
          <p className="text-sm text-blue-600 group-hover:underline">
            Click to change
          </p>
        </div>
      </div>
    </div>
  )

  const NoColorSelected = ({
    onClick,
    label,
  }: {
    onClick: () => void
    label: string
  }) => (
    <div onClick={onClick} className="cursor-pointer group">
      <Label className="mb-2 block">{label}</Label>
      <div className="flex items-center gap-4 rounded-lg border border-dashed p-3 transition-colors hover:border-primary/50">
        <div className="w-16 h-16 rounded-md bg-gradient-to-br from-slate-200 to-gray-200 flex items-center justify-center">
          <Paintbrush className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-lg">Select a Finish</p>
          <p className="text-sm text-blue-600 group-hover:underline">
            Click to choose
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finish Selections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            {isColorSelected(exterior) ? (
              <SelectedColorDisplay
                color={exterior}
                onClick={() => setEditing('exterior')}
                label="Exterior Finish *"
              />
            ) : (
              <NoColorSelected
                onClick={() => setEditing('exterior')}
                label="Exterior Finish *"
              />
            )}
          </div>
          <div>
            <Label
              className={cn('mb-2 block', isSame && 'text-muted-foreground')}
            >
              Interior Finish *
            </Label>
            {isSame ? (
              <div className="opacity-60">
                {isColorSelected(exterior) ? (
                  <div className="flex items-center gap-4 rounded-lg border p-3 bg-slate-50">
                    <div
                      className="w-16 h-16 rounded-md border"
                      style={{ backgroundColor: exterior.hex }}
                    />
                    <div>
                      <p className="font-semibold text-lg">
                        {capitalizeColorName(exterior.name)}
                      </p>
                      <p className="text-sm">Same as exterior</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 rounded-lg border border-dashed p-3 bg-slate-50">
                    <div className="w-16 h-16 rounded-md bg-gradient-to-br from-slate-200 to-gray-200" />
                    <div>
                      <p className="font-semibold">Select exterior first</p>
                    </div>
                  </div>
                )}
              </div>
            ) : isColorSelected(interior) ? (
              <SelectedColorDisplay
                color={interior}
                onClick={() => setEditing('interior')}
                label=""
              />
            ) : (
              <NoColorSelected
                onClick={() => setEditing('interior')}
                label=""
              />
            )}
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
              <Switch
                id="same-color-switch"
                checked={isSame}
                onCheckedChange={(c) =>
                  dispatch({ type: 'SET_COLORS_SAME', payload: c })
                }
              />
              <Label htmlFor="same-color-switch">
                Use same finish for interior
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Glass Selector
const GlassSelector = () => {
  const { state, dispatch } = useQuote()
  const activeItem = state.items[state.activeItemIndex]
  const { tint } = activeItem.glazing

  const handleSelect = (type: 'pane' | 'tint', value: string) => {
    const payload = type === 'pane' ? { paneCount: value } : { tint: value }
    dispatch({
      type: 'SET_GLAZING',
      payload: payload as Partial<{ paneCount: PaneCount; tint: Tint }>,
    })
  }

  const OptionCard = ({
    option,
    isSelected,
    onSelect,
    placeholder,
  }: {
    option: GlazingOption
    isSelected: boolean
    onSelect: () => void
    placeholder?: string
  }) => (
    <Card
      onClick={onSelect}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 relative',
        isSelected && 'border-primary ring-2 ring-primary'
      )}
    >
      <CardContent className="p-6">
        {option.isStandard && (
          <div className="absolute top-3 left-3 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
            Standard Option
          </div>
        )}
        {isSelected && (
          <CheckCircle className="absolute top-3 right-3 h-6 w-6 text-primary fill-white" />
        )}
        <div className="flex justify-center items-center h-24 mb-4">
          <Image
            src={option.image}
            alt={option.name || placeholder || ''}
            width={100}
            height={100}
            className="object-contain"
            data-ai-hint={option.aiHint}
          />
        </div>
        <h4 className="text-lg font-bold">{option.name || placeholder}</h4>
        <p className="text-sm text-muted-foreground mb-3">
          {option.description}
        </p>
        <ul className="space-y-1 text-sm mb-4">
          {option.features.map((feat, i) => (
            <li key={i} className="flex items-start">
              <span className="text-primary mr-2 mt-1">•</span>
              {feat}
            </li>
          ))}
        </ul>
        <p className="text-lg font-semibold">
          {option.price > 0 ? `+$${option.price} per panel` : 'Included'}
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <h3 className="text-xl font-semibold mb-4">Glass Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TINT_OPTIONS.map((o) => (
              <OptionCard
                key={o.name}
                option={o}
                isSelected={tint === o.name}
                onSelect={() => handleSelect('tint', o.name)}
                placeholder="Select Tint"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hardware Selector
const HardwareSelector = () => {
  const { state, dispatch } = useQuote()
  const activeItem = state.items[state.activeItemIndex]
  const { hardwareFinish } = activeItem

  const handleSelect = (finish: HardwareFinish) => {
    dispatch({ type: 'SET_HARDWARE', payload: finish })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mx-auto">
      {HARDWARE_FINISH_OPTIONS.map((option) => (
        <Card
          key={option}
          onClick={() => handleSelect(option)}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center justify-center p-6 h-48 gap-4',
            hardwareFinish === option && 'border-primary ring-2 ring-primary'
          )}
        >
          <div
            className={cn('w-20 h-20 rounded-full', {
              'bg-black': option === 'Black',
              'bg-white border': option === 'White',
              'bg-gray-400': option === 'Silver',
            })}
          />
          <p className="text-xl font-semibold text-center">{option}</p>
        </Card>
      ))}
    </div>
  )
}

// Main Component
export function StepConfigureItem({ onNext }: { onNext: () => void }) {
  const { state, dispatch } = useQuote()
  const activeItem = state.items[state.activeItemIndex]
  const [isProductTypeLocked, setIsProductTypeLocked] = useState(false)

  useEffect(() => {
    // Lock product type if it's set (i.e., coming from product selector page)
    if (activeItem?.product?.type) {
      setIsProductTypeLocked(true)
    }
  }, [activeItem?.product?.type])

  const activeId = useScrollSpy(
    CONFIG_SECTIONS.map((s) => s.id),
    { rootMargin: '0% 0% -80% 0%' }
  )

  const handleProceed = () => {
    dispatch({ type: 'CALCULATE_PRICES' })
    onNext()
  }

  const handleEditProductType = () => {
    setIsProductTypeLocked(false)
  }

  const getProductInfo = (type: ProductId): ProductTypeInfo | undefined => {
    return PRODUCT_TYPES.find((p) => p.id === type)
  }

  if (!isProductTypeLocked) {
    return (
      <StepContainer
        title="Select Product Type"
        description="Choose the base system for this item."
      >
        <ProductTypeSelector />
      </StepContainer>
    )
  }

  const currentProductInfo = getProductInfo(activeItem.product.type)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
      <aside className="hidden md:block md:col-span-1">
        <div className="sticky top-24 space-y-2">
          {currentProductInfo && (
            <div className="mb-8 p-3 bg-slate-50 rounded-lg">
              <h3 className="font-semibold mb-2">Selected Product</h3>
              <div className="relative h-24 w-full rounded-md bg-white p-2 border">
                <Image
                  src={currentProductInfo.image.src}
                  alt={currentProductInfo.image.alt}
                  fill
                  className="object-contain"
                  data-ai-hint={currentProductInfo.image.hint}
                />
              </div>
              <p className="font-medium mt-2">{currentProductInfo.name}</p>
              <Button
                variant="link"
                size="sm"
                onClick={handleEditProductType}
                className="h-auto p-0 text-xs"
              >
                Change Product Type
              </Button>
            </div>
          )}
          <h3 className="font-semibold text-foreground">Configuration Steps</h3>
          {CONFIG_SECTIONS.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                activeId === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <span
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs',
                  activeId === section.id
                    ? 'border-primary-foreground'
                    : 'border-muted-foreground'
                )}
              >
                {index + 1}
              </span>
              <span>{section.title}</span>
            </a>
          ))}
        </div>
      </aside>

      <main className="md:col-span-3">
        <div className="space-y-12">
          <ConfigSection
            title="Size & Configuration"
            id="size"
            sectionNumber={1}
          >
            <SizeAndConfigSelector />
          </ConfigSection>

          <ConfigSection title="Color Selection" id="color" sectionNumber={2}>
            <ColorSelector />
          </ConfigSection>

          <ConfigSection title="Glass Options" id="glass" sectionNumber={3}>
            <GlassSelector />
          </ConfigSection>

          <ConfigSection
            title="Hardware Finish"
            id="hardware"
            sectionNumber={4}
          >
            <HardwareSelector />
          </ConfigSection>

          <div
            id="summary-button"
            className="mt-12 flex justify-end scroll-mt-24"
          >
            <Button
              size="lg"
              onClick={handleProceed}
              className="w-full sm:w-auto"
            >
              Finalize Selections & View Summary{' '}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
