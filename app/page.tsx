"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown, Filter } from "lucide-react";
import { useCallback, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@upstash/vector";
import type { Product } from "@/db";
import ProductItem from "@/components/Products/Product";
import ProductSkeleton from "@/components/Products/ProductSkeleton";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductState } from "@/lib/validators";
import { Slider } from "@/components/ui/slider";
import debounce from "lodash.debounce";
import ProductsEmptyState from "@/components/Products/ProductsEmptyState";

const SORT_OPTIONS = [
	{ name: "None", value: "none" },
	{ name: "Price: Low to Hight", value: "price-asc" },
	{ name: "Price: Hight to Low", value: "price-desc" },
] as const;

const SUBCATEGORIES = [
	{ name: "T-Shirts", selected: true, href: "#" },
	{ name: "Hoodies", selected: false, href: "#" },
	{ name: "Sweatshirts", selected: false, href: "#" },
	{ name: "Accessories", selected: false, href: "#" },
] as const;

const COLOR_FILTERS = {
	id: "clor",
	name: "Color",
	options: [
		{ value: "white", label: "White" },
		{ value: "beige", label: "Beige" },
		{ value: "blue", label: "Blue" },
		{ value: "green", label: "Green" },
		{ value: "purple", label: "Purple" },
	],
} as const;

const PRICE_FILTERS = {
	id: "price",
	name: "Price",
	options: [
		{ value: [0, 100], label: "Any price" },
		{ value: [0, 20], label: "Under 20$" },
		{ value: [0, 40], label: "Under 40$" },
		// custom option defined in JSX
	],
} as const;

const priceRange: [number, number] = [0, 100];

const SIZE_FILTERS = {
	id: "size",
	name: "Size",
	options: [
		{ value: "S", label: "S" },
		{ value: "M", label: "M" },
		{ value: "L", label: "L" },
	],
} as const;

const DEFAULT_CUSTOM_PRICE = [0, 100] as [number, number];

export default function Home() {
	const [filter, setFilter] = useState<ProductState>({
		color: ["white", "beige", "blue", "green", "purple"],
		price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
		size: ["S", "M", "L"],
		sort: "none",
	});

	const { data: products, refetch } = useQuery({
		queryKey: ["products"],
		queryFn: async () => {
			const { data } = await axios.post<QueryResult<Product>[]>(
				"http://localhost:3000/api/products",
				{
					filter: {
						color: filter.color,
						price: filter.price.range,
						size: filter.size,
						sort: filter.sort,
					},
				}
			);

			return data;
		},
	});

	const onSubmit = () => refetch();
	const debouncedSubmit = debounce(onSubmit, 400);
	const _debouncedSubmit = useCallback(debouncedSubmit, []);

	const applyArrayFilter = ({
		category,
		value,
	}: {
		category: keyof Omit<typeof filter, "price" | "sort">;
		value: string;
	}) => {
		const isFilterApplied = filter[category].includes(value as never);

		if (isFilterApplied) {
			setFilter((prev) => ({
				...prev,
				[category]: prev[category].filter((v) => v !== value),
			}));
		} else {
			setFilter((prev) => ({
				...prev,
				[category]: [...prev[category], value],
			}));
		}

		_debouncedSubmit();
	};

	const minPrice = Math.min(filter.price.range[0], filter.price.range[1]);
	const maxPrice = Math.max(filter.price.range[0], filter.price.range[1]);

	return (
		<main className='mx-auto max-w-7xl px-4 sm:px-6 lg: lg:px-8'>
			<div className='flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24'>
				<h1 className='text-4xl font-bold tracking-tight text-gray-900'>
					Clothes collection
				</h1>

				<div className='flex items-center'>
					<DropdownMenu>
						<DropdownMenuTrigger className='group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900'>
							Sort
							<ChevronDown className='-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500' />
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end'>
							{SORT_OPTIONS.map((option) => (
								<button
									key={option.name}
									onClick={() => {
										setFilter((prev) => ({ ...prev, sort: option.value }));

										_debouncedSubmit();
									}}
									className={cn("text-left w-full block px-4 py-2 text-sm", {
										"text-gray-900 bg-gray-100": option.value === filter.sort,
										"text-gray-500": option.value !== filter.sort,
									})}>
									{option.name}
								</button>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<button className='-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden'>
						<Filter className='w-5 h-5' />
					</button>
				</div>
			</div>

			<section className='pb-24 pt-6'>
				<div className='grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4'>
					{/* Filters */}
					<div className='hidden lg:block'>
						<ul className='space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900'>
							{SUBCATEGORIES.map((category) => (
								<li key={category.name}>
									<button
										disabled={!category.selected}
										className='disabled:cursor-not-allowed disabled:opacity-60'>
										{category.name}
									</button>
								</li>
							))}
						</ul>

						<Accordion
							type='multiple'
							className='animate-none'>
							{/* Color filter */}
							<AccordionItem value='color'>
								<AccordionTrigger className='py-3 text-sm text-gray-400 hover:text-gray-500'>
									<span className='font-medium text-gray-900'>Color</span>
								</AccordionTrigger>

								<AccordionContent className='pt-6 animate-none'>
									<ul className='space-y-4'>
										{COLOR_FILTERS.options.map((option, i) => (
											<li
												className='flex items-center'
												key={option.value}>
												<input
													type='checkbox'
													id={`color-${i}`}
													onChange={() =>
														applyArrayFilter({
															category: "color",
															value: option.value,
														})
													}
													checked={filter.color.includes(option.value)}
													className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer'
												/>
												<label
													htmlFor={`color-${i}`}
													className='pl-3 text-sm text-gray-600 cursor-pointer'>
													{option.label}
												</label>
											</li>
										))}
									</ul>
								</AccordionContent>
							</AccordionItem>

							{/* Size filters */}
							<AccordionItem value='size'>
								<AccordionTrigger className='py-3 text-sm text-gray-400 hover:text-gray-500'>
									<span className='font-medium text-gray-900'>Size</span>
								</AccordionTrigger>

								<AccordionContent className='pt-6 animate-none'>
									<ul className='space-y-4'>
										{SIZE_FILTERS.options.map((option, i) => (
											<li
												className='flex items-center'
												key={option.value}>
												<input
													type='checkbox'
													id={`size-${i}`}
													onChange={() =>
														applyArrayFilter({
															category: "size",
															value: option.value,
														})
													}
													checked={filter.size.includes(option.value)}
													className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer'
												/>
												<label
													htmlFor={`size-${i}`}
													className='pl-3 text-sm text-gray-600 cursor-pointer'>
													{option.label}
												</label>
											</li>
										))}
									</ul>
								</AccordionContent>
							</AccordionItem>

							{/* Price filters */}
							<AccordionItem value='price'>
								<AccordionTrigger className='py-3 text-sm text-gray-400 hover:text-gray-500'>
									<span className='font-medium text-gray-900'>Price</span>
								</AccordionTrigger>

								<AccordionContent className='pt-6 animate-none'>
									<ul className='space-y-4'>
										{PRICE_FILTERS.options.map((option, i) => (
											<li
												className='flex items-center'
												key={option.label}>
												<input
													type='radio'
													id={`price-${i}`}
													onChange={() => {
														setFilter((prev) => ({
															...prev,
															price: {
																isCustom: false,
																range: [...option.value],
															},
														}));

														_debouncedSubmit();
													}}
													checked={
														!filter.price.isCustom &&
														filter.price.range[0] === option.value[0] &&
														filter.price.range[1] === option.value[1]
													}
													className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer'
												/>
												<label
													htmlFor={`price-${i}`}
													className='pl-3 text-sm text-gray-600 cursor-pointer'>
													{option.label}
												</label>
											</li>
										))}

										{/* price slider */}
										<li>
											<div className='mb-4'>
												<input
													type='radio'
													id={`price-${PRICE_FILTERS.options.length}`}
													onChange={() => {
														setFilter((prev) => ({
															...prev,
															price: {
																isCustom: true,
																range: priceRange,
															},
														}));

														_debouncedSubmit();
													}}
													checked={filter.price.isCustom}
													className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer'
												/>
												<label
													htmlFor={`price-${PRICE_FILTERS.options.length}`}
													className='pl-3 text-sm text-gray-600 cursor-pointer'>
													Custom
												</label>
											</div>

											<div className='flex justify-between mb-4'>
												<p className='font-medium'>Price</p>
												<div>
													{filter.price.isCustom
														? minPrice.toFixed(0)
														: filter.price.range[0].toFixed(0)}{" "}
													$ -{" "}
													{filter.price.isCustom
														? maxPrice.toFixed(0)
														: filter.price.range[1].toFixed(0)}{" "}
													$
												</div>
											</div>

											<Slider
												disabled={!filter.price.isCustom}
												value={
													filter.price.isCustom
														? filter.price.range
														: DEFAULT_CUSTOM_PRICE
												}
												onValueChange={(range) => {
													const [newMin, newMax] = range;

													setFilter((prev) => ({
														...prev,
														price: {
															isCustom: true,
															range: [newMin, newMax],
														},
													}));
												}}
												min={DEFAULT_CUSTOM_PRICE[0]}
												max={DEFAULT_CUSTOM_PRICE[1]}
												defaultValue={DEFAULT_CUSTOM_PRICE}
												step={5}
												className={cn({ "opacity-10": !filter.price.isCustom })}
											/>
										</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>

					{/* Products */}
					<ul className='grid grid-cols-1 sm:grid-cols-2 lg:col-span-3 md:grid-cols-3 gap-8'>
						{products && products.length === 0 ? (
							<ProductsEmptyState />
						) : products ? (
							products.map((product) => (
								<ProductItem product={product.metadata!} />
							))
						) : (
							new Array(12)
								.fill(null)
								.map((_, i) => <ProductSkeleton key={i} />)
						)}
					</ul>
				</div>
			</section>
		</main>
	);
}
